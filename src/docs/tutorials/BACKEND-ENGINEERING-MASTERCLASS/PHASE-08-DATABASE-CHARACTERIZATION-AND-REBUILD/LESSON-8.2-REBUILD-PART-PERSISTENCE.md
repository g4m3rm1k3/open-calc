# Lesson 8.2: Rebuild Part Persistence

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, permanent characterization test file, `backend/tests/test_parts_characterization.py`, pinning the real, current behavior of all five `/api/parts` CRUD routes (`backend/app/routes/parts.py`) - then a real, permanent rebuild of this project's own persistence boundary: deleting `backend/app/services/part_service.py` (`PartService`) entirely, a real class already proven, in this curriculum's own earlier work, to be complete, self-documented as replacing `Part.from_dict`/ `Part.to_dict`, and imported by zero real routes anywhere. The transferable problem: rebuilding a persistence boundary doesn't always mean adding structure - sometimes the real, correct rebuild is removing a structure that was already never load-bearing, and proving that removal changes nothing by running the identical, already-passing characterization suite against the app both before and after.

**What you need to know first:** What a characterization test is - a permanent test pinning real, current behavior, not a specification; what the five standard CRUD HTTP methods (`POST`/`GET`/`PUT`/`DELETE`) conventionally mean; that a dead, unused class can still be imported and pass its own unit tests while never being called by anything the real application actually runs.

## Terms used in this lesson

- **soft delete** — A real deletion that doesn't remove a row at all - it changes a real status field (here, `Part.status` to `'archived'`) so the row still genuinely exists and is still genuinely queryable, just excluded from whatever real logic treats `'archived'` as effectively gone. It exists so real, historical data - past parts, their real revisions, whatever real rows reference them - isn't actually destroyed by a real delete request, and can be restored or audited later.

## Objects and methods used

- **`GET/POST/PUT/DELETE /api/parts (routes)`**
  - *What it is:* Five real, existing Flask view functions in this project's own backend (`backend/app/routes/parts.py:18-200`), together forming the complete real CRUD surface for `Part` rows.
  - *Implementation:* `get_parts` (`:18-55`) lists/filters via real `.filter(...)` calls; `get_part` (`:58-75`) fetches one real row by id; `create_part` (`:78-133`) validates required fields, checks for a real duplicate `part_number`, and calls `Part.from_dict(data)`; `update_part` (`:136-175`) mutates real, allowed fields directly on an already-loaded instance; `delete_part` (`:178-200`) sets `part.status = 'archived'` rather than calling a real `DELETE`.
  - *Its use:* This lesson's own first unit characterizes all five of these real routes directly, with real HTTP requests through this project's own real `FlaskClient`.
  - *Type:* Five real Flask view functions, registered on the real `parts_bp` blueprint.
  - *Responsibility:* Together, providing the complete real create/read/update/delete surface for `Part` rows over real HTTP - each one independently responsible for its own real validation and real response shape.
  - *Depends on:* This project's own real `Part` model; a real, valid `Authorization` token, since every one of these five real routes is wrapped in `token_required`.
  - *Connects to:* Every one of them calls `Part.from_dict`/`.to_dict()` or real `Part.query` methods directly - none of them, confirmed this session, ever calls the now-deleted `PartService`.
  - *Shape:* Each real route takes a real HTTP request in, returns a real JSON response - `{'data': {...}}` or `{'data': [...], 'total': n}` on success, `{'error': '...'}` with a real, specific status code on failure.

- **`FlaskClient (.post / .get / .put / .delete)`**
  - *What it is:* This project's own real `app.test_client()` return value, already used throughout this curriculum, and four of its real HTTP-verb methods used together for the first time in this lesson.
  - *Implementation:* `client.post(path, json=..., headers=...)`, `client.get(path, headers=...)`, `client.put(path, json=..., headers=...)`, and `client.delete(path, headers=...)` each simulate one real HTTP request of that real method against this app's own real routing, in-process, returning a real `Response`.
  - *Its use:* This lesson's own first unit calls all four, across ten real test functions, to exercise every one of the five real CRUD routes through real, complete HTTP request/response cycles.
  - *Type:* Four real instance methods on `FlaskClient`.
  - *Responsibility:* Simulating a real, complete HTTP request of a specific real method - path, headers, and body together - against this app's own real routing.
  - *Depends on:* A fully-built real `Flask` app instance; a real, valid `Authorization` header - required outright for three of these five routes (`create_part`/`update_part`/`delete_part`, whose own real `allowed_roles=['programming', 'admin']` excludes `'operator'`, so `token_required`'s own bypass never fires), and sent consistently for the other two (`get_parts`/`get_part`, whose own real `allowed_roles` does include `'operator'`) so every real test in this lesson exercises the identical, authenticated path.
  - *Connects to:* Each real call reaches exactly one of the five real view functions named above, running its real, unmodified code.
  - *Shape:* Takes a real path (and optional body/headers) in; returns one real `Response` object, whose `.status_code` is a real `int` and `.get_json()` a real, parsed `dict`.

- **`User and encode_auth_token`**
  - *What it is:* `User` is this project's own real, existing SQLAlchemy model class; `encode_auth_token` is this project's own real, existing function producing a real, signed JWT for a given real user - both required to build the real, valid `Authorization` header this lesson's own tests send on every request, so every real request exercises the identical, authenticated path regardless of which of the five routes happens to also permit the real operator-bypass.
  - *Implementation:* `User(id=..., email=..., name=..., role=...)` (`backend/app/models/user.py`) builds one real, in-memory row; `encode_auth_token(user_id: str, role: str) -> str` (`backend/app/utils/auth_utils.py:163-247`) builds a real payload with a `sub` (the user id) and `role` claim, then signs it with this app's own real, configured `SECRET_KEY`.
  - *Its use:* This lesson's own shared `auth_headers` fixture builds one real `User`, commits it, and calls this real function once, to produce the real token every one of this lesson's own ten test functions sends.
  - *Type:* A real SQLAlchemy model class, and a real, module-level function.
  - *Responsibility:* `User` declares the real mapping for the `users` table; `encode_auth_token` produces one real, cryptographically signed token string that `token_required` can later decode and trust.
  - *Depends on:* A real, live SQLAlchemy `db` extension instance; a real user id and role string.
  - *Connects to:* Its real output goes directly into every one of this lesson's own ten real requests, via the shared `auth_headers` fixture.
  - *Shape:* `User(...)` takes real keyword arguments in, produces one real, unpersisted instance; `encode_auth_token` takes two real strings in, returns one real, signed token string.

- **`Session (.add / .commit)`**
  - *What it is:* The real, live session object this project's own `db` extension exposes as `db.session`, and two of its real methods this lesson's own `auth_headers` fixture uses to persist the real `User` row every request needs.
  - *Implementation:* `db.session.add(instance)` registers one real, new object as pending; `db.session.commit()` flushes every real pending change into real SQL and finalizes the real transaction.
  - *Its use:* Called once, in the shared `auth_headers` fixture, to persist the real `User` row before `encode_auth_token` is called against its real id.
  - *Type:* A real instance of SQLAlchemy's `Session` class (`db.session`).
  - *Responsibility:* Staging a real, new object as pending, then, on `commit`, compiling and sending the real SQL that actually persists it.
  - *Depends on:* A real, open connection from this app's own real `Engine`.
  - *Connects to:* The real `User` row this lesson's own ten real requests all authenticate as.
  - *Shape:* `.add` takes a real object in, returns nothing; `.commit` takes nothing, returns nothing, but has the real, observable side effect of persisting the pending change.

## Concept Unit: Characterizing the Five Real /api/parts CRUD Routes

### The Problem

`backend/app/routes/parts.py`'s own five real routes already have real, current behavior - `create_part` returns a real `409` on a duplicate part number, `delete_part` archives rather than removes a row. None of this is pinned anywhere as a real, permanent test. What real, concrete contract does this lesson's own later rebuild unit have to keep satisfying?

Before reading on:

- `delete_part`'s own real code never calls a real `DELETE` SQL statement - it sets `part.status = 'archived'` and commits. Given that, what would a real, permanent test actually need to check after calling this route, to correctly prove it's a soft delete rather than a hard one?
- `create_part`'s own real code checks `Part.query.filter_by(part_number=data['partNumber']).first()` before creating anything. What real, two-request test sequence would prove that check actually works, rather than merely existing in the source?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/parts.py:18-200` (every one of the five real CRUD routes), read again this session.
- **Files affected:** `backend/tests/test_parts_characterization.py` (new)
- **Change type:** add
- **Location:** N/A - a new, permanent test file; no existing project structure to place it within.
- **Dependencies:** This project's own real `Part`/`User` models; the real `encode_auth_token` function, since every one of these five real routes requires a real, valid token.

### The New Code

The real, complete, permanent test file - ten real test functions across five real test classes, one per CRUD route:

**File:** `backend/tests/test_parts_characterization.py` (new)

```python
"""
Characterization tests for this project's own real, existing /api/parts
CRUD routes (backend/app/routes/parts.py), pinning current, real
behavior before Lesson 8.2's own rebuild of the persistence/application
boundary touches it - not what these routes should do, what they
actually do, verified against a real, running Flask app.

Covers all five real routes named in this lesson's own scope:
POST /api/parts, GET /api/parts, GET /api/parts/<id>, PUT /api/parts/<id>,
DELETE /api/parts/<id>.
"""
import pytest

from app import create_app, db
from app.models.part import Part
from app.utils.auth_utils import encode_auth_token
from app.models.user import User


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        yield application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(app):
    user = User(id="U-PARTS-TEST", email="parts-test@example.com", name="Parts Tester", role="programming")
    db.session.add(user)
    db.session.commit()
    token = encode_auth_token("U-PARTS-TEST", "programming")
    return {"Authorization": f"Bearer {token}"}


class TestCreatePart:
    """POST /api/parts"""

    def test_create_part_returns_201_and_real_data(self, client, auth_headers):
        resp = client.post(
            "/api/parts",
            json={"partNumber": "1112223", "description": "Test Bracket"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        body = resp.get_json()
        assert body["data"]["partNumber"] == "1112223"
        assert body["data"]["id"].startswith("P-")

    def test_create_part_missing_required_field_returns_400(self, client, auth_headers):
        resp = client.post("/api/parts", json={"partNumber": "1112223"}, headers=auth_headers)
        assert resp.status_code == 400

    def test_create_part_duplicate_part_number_returns_409(self, client, auth_headers):
        client.post("/api/parts", json={"partNumber": "9998887", "description": "First"}, headers=auth_headers)
        resp = client.post("/api/parts", json={"partNumber": "9998887", "description": "Second"}, headers=auth_headers)
        assert resp.status_code == 409


class TestListParts:
    """GET /api/parts"""

    def test_list_parts_returns_real_created_part(self, client, auth_headers):
        client.post("/api/parts", json={"partNumber": "5556667", "description": "Listed Part"}, headers=auth_headers)
        resp = client.get("/api/parts", headers=auth_headers)
        assert resp.status_code == 200
        numbers = [p["partNumber"] for p in resp.get_json()["data"]]
        assert "5556667" in numbers

    def test_list_parts_status_filter(self, client, auth_headers):
        create = client.post("/api/parts", json={"partNumber": "4443332", "description": "Filtered"}, headers=auth_headers)
        part_id = create.get_json()["data"]["id"]
        client.put(f"/api/parts/{part_id}", json={"status": "released"}, headers=auth_headers)
        resp = client.get("/api/parts?status=released", headers=auth_headers)
        numbers = [p["partNumber"] for p in resp.get_json()["data"]]
        assert "4443332" in numbers


class TestGetPart:
    """GET /api/parts/<id>"""

    def test_get_existing_part_returns_200(self, client, auth_headers):
        create = client.post("/api/parts", json={"partNumber": "1231234", "description": "Gettable"}, headers=auth_headers)
        part_id = create.get_json()["data"]["id"]
        resp = client.get(f"/api/parts/{part_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["data"]["partNumber"] == "1231234"

    def test_get_nonexistent_part_returns_404(self, client, auth_headers):
        resp = client.get("/api/parts/P-DOES-NOT-EXIST", headers=auth_headers)
        assert resp.status_code == 404


class TestUpdatePart:
    """PUT /api/parts/<id>"""

    def test_update_part_description(self, client, auth_headers):
        create = client.post("/api/parts", json={"partNumber": "7778889", "description": "Original"}, headers=auth_headers)
        part_id = create.get_json()["data"]["id"]
        resp = client.put(f"/api/parts/{part_id}", json={"description": "Updated"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["data"]["description"] == "Updated"

    def test_update_nonexistent_part_returns_404(self, client, auth_headers):
        resp = client.put("/api/parts/P-DOES-NOT-EXIST", json={"description": "x"}, headers=auth_headers)
        assert resp.status_code == 404


class TestDeletePart:
    """DELETE /api/parts/<id> - real, current behavior is a soft delete."""

    def test_delete_part_soft_archives_rather_than_removing_the_row(self, client, auth_headers):
        create = client.post("/api/parts", json={"partNumber": "6665554", "description": "Deletable"}, headers=auth_headers)
        part_id = create.get_json()["data"]["id"]
        resp = client.delete(f"/api/parts/{part_id}", headers=auth_headers)
        assert resp.status_code == 200

        reloaded = client.get(f"/api/parts/{part_id}", headers=auth_headers)
        assert reloaded.status_code == 200
        assert reloaded.get_json()["data"]["status"] == "archived"
```

### Mechanical Walkthrough

- `@pytest.fixture def auth_headers(app): ... return {"Authorization": f"Bearer {token}"}` — A real, shared fixture producing a real, valid `Authorization` header - outright required for three of these five real routes (`create_part`/`update_part`/`delete_part`, whose own real `allowed_roles=['programming', 'admin']` excludes `'operator'`, so `token_required`'s own real bypass never fires), and sent the identical way for the other two (`get_parts`/`get_part`, whose own real `allowed_roles` does include `'operator'`) so every real test here exercises the same, authenticated path consistently.
- `test_create_part_duplicate_part_number_returns_409` — Sends the identical real `partNumber` twice - the second real request is what actually exercises `create_part`'s own real duplicate check, proving the real `409` fires, not just that the checking code exists in the source.
- `test_delete_part_soft_archives_rather_than_removing_the_row` — Calls the real `DELETE` route, then immediately makes a second, real `GET` request for the identical id - proof the row still genuinely exists and is still genuinely queryable, with only its real `status` changed, rather than trusting the delete route's own `200` response alone.
- `test_list_parts_status_filter` — Creates a real part, updates its real status via the real `PUT` route, then filters for it via `GET /api/parts?status=released` - proving the real filter actually reads the current, committed database state, not a value cached anywhere in the request.

### CS Lens

This is a **golden master**: real, current request/response behavior captured as a real, permanent assertion, so this lesson's own next unit can prove its rebuild changed nothing observable. Also recognized in: a real API gateway's own contract tests, recorded from actual, live traffic; a real UI snapshot test, comparing a rendered component against a previously-approved render; and, in this project's own domain, this project's own real `verification/` folder's own saved output files, the identical kind of pinning, just outside the permanent test suite.

### SE Lens

The design principle is that these tests go through the real HTTP layer (`client.post`, not calling `create_part` directly), because the rebuild this lesson is about to perform touches the persistence *layer beneath* the routes, not the routes themselves - characterizing at the HTTP boundary is what lets the internal implementation change freely underneath, as long as these real requests keep producing the identical real responses. The real alternative not chosen here - characterizing by calling `Part.from_dict`/`.to_dict()` and the route functions directly, in Python, skipping real HTTP - would run faster; the honest cost of that real alternative: it would miss any real behavior that lives in `token_required`, in Flask's own real routing, or in `jsonify`'s own real response construction, none of which this lesson's own actual rebuild is about, but all of which a real client actually depends on.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_parts_characterization.py -v` — Runs this real, permanent test file with pytest, from the repository root.

### Verification

```text
backend/tests/test_parts_characterization.py::TestCreatePart::test_create_part_returns_201_and_real_data PASSED
backend/tests/test_parts_characterization.py::TestCreatePart::test_create_part_missing_required_field_returns_400 PASSED
backend/tests/test_parts_characterization.py::TestCreatePart::test_create_part_duplicate_part_number_returns_409 PASSED
backend/tests/test_parts_characterization.py::TestListParts::test_list_parts_returns_real_created_part PASSED
backend/tests/test_parts_characterization.py::TestListParts::test_list_parts_status_filter PASSED
backend/tests/test_parts_characterization.py::TestGetPart::test_get_existing_part_returns_200 PASSED
backend/tests/test_parts_characterization.py::TestGetPart::test_get_nonexistent_part_returns_404 PASSED
backend/tests/test_parts_characterization.py::TestUpdatePart::test_update_part_description PASSED
backend/tests/test_parts_characterization.py::TestUpdatePart::test_update_nonexistent_part_returns_404 PASSED
backend/tests/test_parts_characterization.py::TestDeletePart::test_delete_part_soft_archives_rather_than_removing_the_row PASSED
====================== 10 passed, 104 warnings in 4.70s =======================
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

This lesson's own first unit; it produces the real, permanent contract the next unit's own rebuild has to keep satisfying.

## Concept Unit: Rebuilding the Persistence Boundary - Removing a Real, Dead Layer

### The Problem

This project's own real `PartService` (`backend/app/services/part_service.py`) already exists, complete, and its own docstrings claim to replace `Part.from_dict`/ `Part.to_dict` - confirmed, in this curriculum's own earlier work, to be imported by zero real routes anywhere. What does "rebuild the persistence/application boundary" actually mean here, given the real routes already work correctly without it?

Before reading on:

- If a real class has zero real callers anywhere in the application, what real, observable difference would deleting it entirely make to any real request this lesson's own characterization suite just proved works?
- A real, exhaustive, repo-wide search for `PartService`/ `part_service` is one real kind of evidence that nothing calls it; this lesson's own ten-test characterization suite passing afterward is a different, real kind of evidence. Which one actually proves nothing in the *entire* application depends on this file, and which one only proves these ten, specific, already-characterized behaviors still work?

### Project Change

- **Reference Source:** Real specimen: `backend/app/services/part_service.py:1-65` (`PartService`, in full) and `backend/app/routes/parts.py:53, 72,123,130,170,172` (every real `to_dict`/`from_dict` call site in that file, calling the model directly), both read again this session, and reconfirmed by a fresh, repo-wide search this session for `PartService`/`part_service` returning exactly one real match: the file's own definition.
- **Files affected:** `backend/app/services/part_service.py` (new)
- **Change type:** remove
- **Location:** N/A - the entire real file is removed.
- **Dependencies:** The real, exhaustive, repo-wide search already run confirming zero real importers - the actual, deterministic basis for this removal being safe; this lesson's own first unit's already-passing characterization suite, re-run afterward as a real, secondary check on the specific behavior it covers, not as proof about the rest of the application.

### Mechanical Walkthrough

- `rm backend/app/services/part_service.py` — Removes the real file entirely - not commented out, not deprecated with a warning, genuinely deleted, since a fresh, repo-wide search this session already confirmed nothing real depends on it.
- `python -m pytest backend/tests/ -v (every real file under backend/tests/, not just this lesson's own new one)` — Re-runs every real, permanent test this project currently has - 32 total, across `test_health.py`, `test_operation_manager.py`, `test_part_model.py`, `test_schema_characterization.py`, and this lesson's own new file - a real, secondary check that the specific, already-characterized behavior these 32 tests cover is unaffected. This is a genuinely small, partial slice of a real application with 18 real route files; it does not, on its own, prove nothing anywhere else in the app depends on the removed file - the real, exhaustive search already run (zero importers, checked directly) is what actually establishes that.

### CS Lens

This is **dead code elimination**: removing a real, reachable-by- name-but-never-called structure entirely, rather than leaving it present "in case," once real evidence confirms nothing calls it. Also recognized in: a real compiler's own dead-code-elimination pass, stripping functions no real call graph path reaches; a real linter flagging an unused real import for removal; and, in this project's own domain, this curriculum's own earlier, real finding that `app/services/mastercam_xml_parser.py` is the identical kind of dead code, superseded by `final_parser.py`, still sitting in the real repository, not yet removed.

### SE Lens

The design principle is that a rebuild's own real job includes removing structure that isn't earning its keep, not only adding structure that's missing - and that the real basis for trusting a removal like this is exhaustive, static evidence (a real, repo-wide search confirming zero importers), not a test suite's own pass/fail, since a 32-test suite covering a fraction of an 18-route-file application could never, on its own, rule out every real, indirect dependency. The real alternative not chosen here - leaving `PartService` in place, unused, on the theory that it might be wired in "later" - costs nothing to the real, running application today; the honest cost already being paid by that alternative, before this unit's own real removal: every future reader of this codebase has to notice this real class, read it, and independently rule it out as dead, the identical real cost this curriculum's own earlier work already named directly.

### Commands needed

- `rm backend/app/services/part_service.py` — Deletes the real, dead file, from the repository root.
- `backend/.venv/Scripts/python.exe -m pytest backend/tests/ -v` — Runs every real test file currently under `backend/tests/` - 32 tests total, a real but genuinely partial slice of this application - from the repository root.

### Verification

```text
====================== 32 passed, 242 warnings in 13.17s ======================
```

Full saved run: `N/A - every real file under backend/tests/, run together; not a saved verification/ output pair.`.

### Connection to the previous unit

The previous unit produced the real, permanent contract; this unit performs the real rebuild - not adding a new persistence layer, but removing one that was never actually load-bearing - and proves it with the identical, already-passing suite, plus every other real test this project already had.

## Connect the pieces

Ten real, permanent tests, `backend/tests/test_parts_characterization.py`, pin every one of `/api/parts`'s five real CRUD routes' current behavior - a real `201` on create, a real `409` on a duplicate part number, a real `404` on a missing id, and, specifically, that `DELETE` archives rather than removes a row, confirmed by a real, follow-up `GET` still returning `200`. Then, `PartService` - a real, complete, self-documented class this curriculum's own earlier work already proved has zero real callers - is deleted entirely. The real basis for trusting that removal is the exhaustive, repo-wide search confirming zero importers - deterministic evidence a test suite covering only a fraction of this application's 18 route files could never provide on its own. The 32-test suite passing afterward, all still passing right after the deletion, is a real, secondary confirmation that the specific, already- characterized behavior it covers is unaffected - not a claim that the whole application was verified.

**Next lesson:** This lesson rebuilt a persistence boundary by removing an unused layer. Next, this curriculum rebuilds `Machine`'s own persistence, where real validation, real relationships, real transactions, and real indexes all actually matter to what gets built.