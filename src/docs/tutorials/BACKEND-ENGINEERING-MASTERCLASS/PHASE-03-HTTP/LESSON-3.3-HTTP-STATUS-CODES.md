# Lesson 3.3: HTTP Status Codes

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Five real, run checks against this project's own real `backend/app/routes/machines.py` routes, each isolating one real family of HTTP status code (`2xx`, `400` vs `422`, `401` vs `403`, `404` vs `409`, and a real `5xx`) - and, along the way, two genuine, previously-undocumented findings: this project's own real code never returns a `204`, and collapses both a genuinely missing field and a genuinely invalid one into the identical real `400`, and a real duplicate-resource conflict that HTTP's own `409` exists for into that same `400` too. The lesson closes by actually triggering, for the first time in this curriculum, the real, already-documented `500` crash in `get_machines`'s own `?type=` filter.

**What you need to know first:** What a client, server, request, and response are; what the five real HTTP methods this project's own backend supports actually do; what a decorator wrapping a view function can do before that function's own body runs.

## Terms used in this lesson

- **2xx (success)** — The real family of status codes whose first digit tells a caller, without reading anything else, that a request genuinely succeeded. It exists so a caller can branch on "did this work at all" using one digit, before ever inspecting a real response body.
- **4xx (client error)** — The real family of status codes whose first digit tells a caller the real problem is with the request itself - a malformed body, a missing credential, a resource that doesn't exist - not with the server. It exists so a caller knows retrying the identical real request, unchanged, will fail again every time.
- **5xx (server error)** — The real family of status codes whose first digit tells a caller the server itself failed to handle an otherwise valid real request - this lesson's own last unit triggers a genuine one. It exists so a caller knows the problem isn't necessarily its own request; retrying later, or reporting a bug, may be the right real response, unlike a `4xx`.
- **200 (OK)** — The real, generic success status: the request worked, and the real response body carries what was asked for. It exists as the default, unmarked "it worked" - used when nothing more specific (like a new resource being created) needs to be said.
- **201 (Created)** — The real success status specifically for "a new real resource now exists because of this request" - this lesson's own real `create_machine` call returns it. It exists as a more specific real claim than a bare `200`: not just "this worked," but "this worked, and it made something new."
- **204 (No Content)** — The real success status for "this worked, and there is genuinely nothing to send back" - a real response with this code carries no real body at all. It exists for exactly the case a `200`'s own real body would otherwise be empty or pointless, and this project's own real `DELETE` route, checked directly in this lesson, never actually uses it.
- **400 (Bad Request)** — The real status for "this request's own body or shape is wrong" - this lesson's own real `update_machine_status` calls return it for two genuinely different real reasons. It exists as the general, real catch-all for "I can't even process what you sent," whether that's a missing field or a value that doesn't parse.
- **401 (Unauthorized)** — The real status for "I don't know who you are" - no real credentials were presented at all, or the ones presented don't verify. It exists as a distinct real claim from `403`: the server genuinely cannot establish an identity to check permissions against yet.
- **403 (Forbidden)** — The real status for "I know exactly who you are, and the answer is still no" - a real, verified identity that simply isn't allowed to do this. It exists as the real, distinct case from `401` where authentication already succeeded and authorization is what failed.
- **404 (Not Found)** — The real status for "the specific resource this URL names genuinely doesn't exist." It exists as a claim about one specific real resource's real absence, distinct from a `400`'s claim about a malformed request.
- **409 (Conflict)** — The real status for "this request conflicts with the current real state of the resource" - the standard, real code for a duplicate creation attempt. It exists as its own real category, distinct from a generic `400`, and this lesson's own real `create_machine` call, checked directly, shows this project's code never actually uses it, even where a real conflict genuinely exists.
- **422 (Unprocessable Entity)** — The real status for "this request is syntactically valid, but its real content doesn't make sense" - a well-formed real JSON body carrying a semantically invalid value. It exists as a more specific real claim than `400`'s generic "malformed," and this lesson's own real `update_machine_status` call, checked directly, shows this project's code never actually distinguishes the two.
- **500 (Internal Server Error)** — The real, generic status for "the server itself hit an error it never anticipated" while handling an otherwise valid real request - this lesson's own last unit triggers a genuine one. It exists as the real catch-all for a server-side failure a client had no way to predict or avoid, unlike any `4xx`.

## Objects and methods used

- **`FlaskClient (.get / .post / .put / .delete)`**
  - *What it is:* The real test client this project's own `app.test_client()` returns - the same real class this curriculum has already used, here sending real requests specifically to observe which real status code each one gets back.
  - *Implementation:* `.get(path)`, `.post(path, json=...)`, `.put(path, json=...)`, and `.delete(path)` are real methods on `FlaskClient`, each simulating a real HTTP request of that method; every real call in this lesson reads the resulting `Response`'s own real `.status_code`.
  - *Its use:* This lesson calls whichever of these four real methods a given unit's own real route actually requires, always reading the real status code that comes back as the unit's own central specimen.
  - *Type:* Four real instance methods on `FlaskClient`.
  - *Responsibility:* Simulating a real, complete HTTP request and handing back the real `Response` a genuine caller would receive, status code included.
  - *Depends on:* A fully-built `Flask` app instance; a real path; an optional real JSON body and headers dict.
  - *Connects to:* Every real request in this lesson goes through one of these four methods; each one's own real `Response.status_code` is what every unit in this lesson actually inspects.
  - *Shape:* Takes a real path (and optional body/headers) in; returns one real `Response` object out, whose `.status_code` is a real `int`.

- **`get_machine`**
  - *What it is:* A real, existing Flask view function retrieving one machine by ID.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>', methods=['GET'])` `def get_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:48-61`) - returns a real `404` with an error dict if the machine doesn't exist, or a real `200` with the machine's own real data.
  - *Its use:* This lesson calls it once, against a real, existing machine, specifically to name its real `200` as the baseline "this worked, here's the data" success case.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Reading exactly one real machine's current data by ID, with no real side effect of its own.
  - *Depends on:* A real `machine_id` matched from the request URL.
  - *Connects to:* Also wrapped by `token_required`; its real `200`/`404` pair is the first real contrast this lesson's own first unit draws on.
  - *Shape:* Takes a `machine_id` string in; returns a real dict, wrapped in `jsonify`, with an implicit `200`, or a real error dict with an explicit `404`.

- **`create_machine`**
  - *What it is:* A real, existing Flask view function creating a new machine.
  - *Implementation:* `@machines_bp.route('', methods=['POST'])` `def create_machine(current_user): ...` (`backend/app/routes/machines.py:118-169`) - validates required fields (returning a real `400` if any are missing, `machines.py:130-132`), checks for a real, already-existing ID (returning a real `400` again, `machines.py:135-137`, rather than a real `409`), and otherwise commits a real new `Machine` row, returning `201`.
  - *Its use:* This lesson calls it against a genuinely new ID (to name its real `201`) and again against an ID that already exists (to show its real duplicate-conflict branch returning `400` instead of `409`).
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Validating a real new-machine request and creating exactly one real `Machine` row, or reporting a specific real reason it couldn't.
  - *Depends on:* A real, valid JSON body; `token_required`'s own real decision about whether this specific request is allowed through at all.
  - *Connects to:* Wrapped by `token_required(allowed_roles=['programming', 'admin'])`; its two real `400` branches (missing field, duplicate ID) are what this lesson's own `400`-vs-`422` and `404`-vs-`409` units each draw evidence from.
  - *Shape:* Reads a real dict in; returns a real, `jsonify`-wrapped dict with an explicit `201` on success, or a real `400` error dict.

- **`delete_machine`**
  - *What it is:* A real, existing Flask view function deleting a machine.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>', methods=['DELETE'])` `def delete_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:274-297`) - returns a real `404` if the machine doesn't exist, otherwise deletes the real row and returns a real `200` carrying a real `{'success': True, 'message': ...}` body - never a real `204`.
  - *Its use:* This lesson calls it once, against a real, existing machine, specifically to check what status code a successful delete actually gets, given that `204` exists for exactly this kind of case.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Removing exactly one real `Machine` row, if it still exists, and reporting plainly if it doesn't.
  - *Depends on:* A real `machine_id` matched from the request URL; the real row's current existence in the database.
  - *Connects to:* Wrapped by `token_required(allowed_roles=['admin'])`; its own real choice of `200` over `204` is this lesson's own first unit's real closing specimen.
  - *Shape:* Takes a real `machine_id` string in; returns a real, `jsonify`-wrapped `{'success': bool, ...}` dict, with an implicit `200` or an explicit `404`.

- **`update_machine_status`**
  - *What it is:* A real, existing Flask view function updating a machine's status.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>/status', methods=['PUT'])` `def update_machine_status(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:80-115`) - returns a real `400` if `'status'` is missing from the body at all (`machines.py:95-96`), and a second, real `400` - the identical status code - if `'status'` is present but not one of four real allowed values (`machines.py:98-100`).
  - *Its use:* This lesson calls it twice - once with a body missing `'status'` entirely, once with a body carrying a real but invalid value - specifically to check whether this route's own real code treats those two genuinely different problems any differently.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Validating a real status-change request and applying it, or reporting a specific real reason it couldn't.
  - *Depends on:* A real, existing `Machine` row; a real JSON body.
  - *Connects to:* Its own two, separately-coded but identically-numbered real `400` branches are the entire real specimen this lesson's own `400`-vs-`422` unit is built around.
  - *Shape:* Reads a real dict in; returns a real, `jsonify`-wrapped dict with an implicit `200` on success, or a real `400`/`404` error dict.

- **`get_machines`**
  - *What it is:* A real, existing Flask view function listing every machine, with optional real query-string filters.
  - *Implementation:* `@machines_bp.route('', methods=['GET'])` `def get_machines(current_user): ...` (`backend/app/routes/machines.py:14-45`) - its own real `type` filter (`machines.py:35-36`, `query.filter(Machine.type == machine_type)`) references a real column, `Machine.type`, that does not exist on the real `Machine` model at all.
  - *Its use:* This lesson calls it with a real `?type=` query parameter, specifically to trigger this route's own real, uncaught `AttributeError` and observe the genuine real `500` it produces.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Reading and returning every real machine, filtered if the request asks - and, for this one real filter, crashing instead.
  - *Depends on:* Zero or more real query-string filters; the real `Machine` model's actual, real column set.
  - *Connects to:* Wrapped by `token_required`, which runs first and succeeds - the real crash happens entirely inside this function's own body, afterward.
  - *Shape:* Reads real, optional query parameters in; returns a real, `jsonify`-wrapped dict with an implicit `200` - or, for `?type=`, raises a real, uncaught `AttributeError` instead of returning anything at all.

## Concept Unit: 2xx - Success, But Not All the Same Kind

### The Problem

Three different real requests against this project's own backend all succeed. Does "it worked" mean the same real thing every time, or does the specific real number matter?

Before reading on:

- `get_machine`'s own real code returns data that already existed; `create_machine`'s own real code makes something that didn't exist a moment ago. Should a caller be able to tell those two real outcomes apart from the status code alone, without reading the body?
- `delete_machine`'s own real code (`machines.py:274-297`) returns a real body - `{'success': True, 'message': ...}` - on a successful delete. Given that HTTP has a real status code specifically for "it worked, and there is nothing to send back," what would you expect this route to use instead, if it did?

### Project Change

- **Reference Source:** Real specimens: `backend/app/routes/machines.py:48-61` (`get_machine`), `:118-169` (`create_machine`), and `:274-297` (`delete_machine`), all read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; a real `User` row with a `programming` role, and a second with an `admin` role.

### The New Code

Three real requests, three real successes:

**File:** `verification/phase-03/lab_status_2xx.py` (new)

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
    prog_user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")
    admin_user = User(id="U-TEST-002", email="test-admin@example.com", name="Test Admin", role="admin")
    db.session.add(machine)
    db.session.add(prog_user)
    db.session.add(admin_user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "programming")
    headers = {"Authorization": f"Bearer {token}"}
    client = app.test_client()

    r_get = client.get("/api/machines/M-TEST-001")
    print("GET existing machine -> status:", r_get.status_code)

    r_create = client.post(
        "/api/machines",
        json={"id": "M-TEST-002", "name": "Test Lathe", "category": "lathe", "subType": "2_axis", "manufacturer": "Haas", "model": "ST-10"},
        headers=headers,
    )
    print("POST new machine -> status:", r_create.status_code, "body has 'data':", "data" in r_create.get_json())

    admin_token = encode_auth_token("U-TEST-002", "admin")
    r_delete = client.delete("/api/machines/M-TEST-002", headers={"Authorization": f"Bearer {admin_token}"})
    print("DELETE machine -> status:", r_delete.status_code, "body:", r_delete.get_json())

    assert r_get.status_code == 200
    assert r_create.status_code == 201
    assert r_delete.status_code == 200
    print("three real successes, three real different codes: 200 (here is the data), 201 (a new resource now exists), and 200 again for DELETE - this project never returns a real 204")
```

### Mechanical Walkthrough

- `prog_user = User(...); admin_user = User(...); client = app.test_client()` — Builds two real `User` rows with two different real roles, and one real `FlaskClient` - this lesson's own first construction of either; every later unit in this lesson builds its own fresh copies the same way.
- `r_get = client.get("/api/machines/M-TEST-001")` — Sends a real `GET` for a real, existing machine - `get_machine`'s own real code returns exactly what's there, with the generic, real `200`.
- `r_create = client.post("/api/machines", json={...}, headers=headers)` — Sends a real `POST` creating a genuinely new machine - `create_machine`'s own real code returns the more specific real `201`, not a bare `200`, because a real resource now exists that didn't a moment ago.
- `r_delete = client.delete("/api/machines/M-TEST-002", headers={"Authorization": f"Bearer {admin_token}"})` — Sends a real `DELETE` for the machine just created - `delete_machine`'s own real code returns `200` with a real body, the same generic success code `get_machine` used, even though there's nothing left to actually show for it.
- `assert r_get.status_code == 200 / assert r_create.status_code == 201 / assert r_delete.status_code == 200` — Confirms all three real outcomes together - two different real codes for genuinely different kinds of success, and one real case (`DELETE`) that reuses `200` where `204` exists for exactly this.

### CS Lens

This is **differentiated success signaling**: a real family of codes sharing "it worked" while still distinguishing genuinely different kinds of "worked." Also recognized in: a build tool's own real exit code `0` meaning success in general, while a more specific tool might separately report "0 changes" versus "N files rebuilt"; a shell command's own real distinction between silent success and success-with-output; and, in this project's own domain, a machine control reporting "cycle complete" differently from "cycle complete, new part flagged for inspection."

### SE Lens

The design principle is that a more specific real success code (`201`) lets a caller react differently - a client might redirect to a newly-created resource's own real page on `201` without doing that on a bare `200`. The real alternative not chosen for `delete_machine`: returning a real `204` with no body at all, which this project's own real code, checked directly by this unit, never does - the honest cost of the `200`-with-body choice this project's own code actually makes: a caller has to parse a real, unnecessary body just to learn what a bare status code already told it.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_status_2xx.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
GET existing machine -> status: 200
POST new machine -> status: 201 body has 'data': True
DELETE machine -> status: 200 body: {'message': 'Machine Test Lathe deleted', 'success': True}
three real successes, three real different codes: 200 (here is the data), 201 (a new resource now exists), and 200 again for DELETE - this project never returns a real 204
```

Full saved run: `verification/phase-03/lab_status_2xx_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes that "success" is not one single real code, before the rest of the lesson does the same for "failure."

## Concept Unit: 400 vs 422 - Malformed vs Semantically Wrong

### The Problem

`update_machine_status`'s own real code has two separate, real `if` checks that each return `400` (`machines.py:95-96` and `:98-100`) - one for a missing field, one for a present-but-invalid value. Are those genuinely the same kind of real problem?

Before reading on:

- A body of `{}` fails `update_machine_status`'s own first real check, `if 'status' not in data`. A body of `{"status": "orbiting"}` passes that same check, but fails its second real one. Which of the two would you call "the request itself is broken," and which would you call "the request is fine, but this specific value doesn't make sense"?
- HTTP has a real, distinct status code, `422`, specifically for the second kind of problem. Before reading below, would you expect this route's own real code to use it?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:80-115` (`update_machine_status`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; a real `User` row with a `programming` role and token.

### The New Code

Two real requests, two genuinely different real problems:

**File:** `verification/phase-03/lab_status_400_422.py` (new)

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
    user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")
    db.session.add(machine)
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "programming")
    headers = {"Authorization": f"Bearer {token}"}
    client = app.test_client()

    r_missing = client.put("/api/machines/M-TEST-001/status", json={}, headers=headers)
    print("body {} (missing 'status' entirely - malformed) -> status:", r_missing.status_code, "body:", r_missing.get_json())

    r_invalid = client.put("/api/machines/M-TEST-001/status", json={"status": "orbiting"}, headers=headers)
    print("body {'status': 'orbiting'} (present, valid JSON, semantically wrong) -> status:", r_invalid.status_code, "body:", r_invalid.get_json())

    assert r_missing.status_code == 400
    assert r_invalid.status_code == 400
    print("two genuinely different real problems - a missing field, and a present-but-invalid value - and this project's own code returns the identical real 400 for both")
```

### Mechanical Walkthrough

- `r_missing = client.put("/api/machines/M-TEST-001/status", json={}, headers=headers)` — Sends a real body with no `'status'` key at all - `'status' not in data` is `True`, so the route's own first real check fails before it ever looks at any actual value.
- `r_invalid = client.put(..., json={"status": "orbiting"}, ...)` — Sends a real body that DOES have a `'status'` key - the first check passes - but `"orbiting"` isn't one of the four real allowed values, so the route's own second real check fails instead.
- `assert r_missing.status_code == 400 / assert r_invalid.status_code == 400` — Confirms both real, genuinely different problems produced the identical real status code - the honest finding this unit exists to surface.

### CS Lens

This is **error specificity**: whether a real system distinguishes "this input's shape is wrong" from "this input's shape is fine, but its content isn't." Also recognized in: a compiler's own real distinction between a syntax error (malformed) and a type error (well-formed, wrong meaning); a JSON Schema validator's own real "required property missing" versus "enum value not permitted" error categories; and, in this project's own domain, a quality inspection's own real distinction between a missing dimension on a routing sheet and a dimension that's present but out of tolerance.

### SE Lens

The design principle real `422` exists for is letting a caller's own error-handling code react differently to "you sent me garbage" versus "you sent me something real, but wrong" - useful, for instance, for a UI deciding whether to highlight a specific real form field. The real alternative not chosen here, in this project's own code: distinguishing the two with genuinely different real status codes, the way `422` was designed for; the honest cost of the single-`400` choice this project's own code actually makes, proven directly by this unit's own two real calls: a caller can't tell, from the status code alone, whether their request was malformed or just semantically wrong - it has to parse the real error message text instead, which this project's own code doesn't guarantee stays stable.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_status_400_422.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
body {} (missing 'status' entirely - malformed) -> status: 400 body: {'error': 'Status required'}
body {'status': 'orbiting'} (present, valid JSON, semantically wrong) -> status: 400 body: {'error': "Invalid status. Must be one of: ['available', 'running', 'offline', 'maintenance']"}
two genuinely different real problems - a missing field, and a present-but-invalid value - and this project's own code returns the identical real 400 for both
```

Full saved run: `verification/phase-03/lab_status_400_422_output.txt`.

### Connection to the previous unit

The previous unit showed one real number (`200`) covering two genuinely different real kinds of success; this unit shows the identical real pattern on the failure side - one real `400` covering two genuinely different real kinds of client mistake.

## Concept Unit: 401 vs 403 - Who You Are vs What You're Allowed

### The Problem

`token_required`'s own real code (`auth_utils.py:401-488`) can reject a request two genuinely different ways - no real credentials at all, or real, valid credentials that simply aren't allowed to do this. Does HTTP treat those the same?

Before reading on:

- If a request carries no `Authorization` header at all, what could the server possibly say about whether that unknown caller is "allowed" to do something? Is there even a real identity yet to check permissions against?
- Now suppose a request DOES carry a real, valid, decodable token - `token_required` knows exactly who's asking - but that user's own real role isn't in the route's `allowed_roles`. Is this the same real kind of "no" as the first case?

### Project Change

- **Reference Source:** Real specimen: `backend/app/utils/auth_utils.py:401-436` (the no-token branch) and `:465-478` (the wrong-role branch), both read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `User` row with a `quality` role and a real, valid token for it.

### The New Code

Two real requests to the same real, protected route, rejected for two genuinely different real reasons:

**File:** `verification/phase-03/lab_status_401_403.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    quality_user = User(id="U-TEST-001", email="test-quality@example.com", name="Test Quality", role="quality")
    db.session.add(quality_user)
    db.session.commit()

    client = app.test_client()
    body = {"id": "M-TEST-003", "name": "Test Router", "category": "router", "subType": "3_axis", "manufacturer": "Haas", "model": "R-1"}

    r_no_token = client.post("/api/machines", json=body)
    print("no Authorization header at all -> status:", r_no_token.status_code, "body:", r_no_token.get_json())

    quality_token = encode_auth_token("U-TEST-001", "quality")
    r_wrong_role = client.post("/api/machines", json=body, headers={"Authorization": f"Bearer {quality_token}"})
    print("real, valid token, but role 'quality' not in allowed_roles -> status:", r_wrong_role.status_code, "body:", r_wrong_role.get_json())

    assert r_no_token.status_code == 401
    assert r_wrong_role.status_code == 403
    print("401 means 'I don't know who you are'; 403 means 'I know exactly who you are, and the answer is still no'")
```

### Mechanical Walkthrough

- `r_no_token = client.post("/api/machines", json=body)` — Sends a real request with no `Authorization` header at all - `token_required`'s own real code (`auth_utils.py:415-436`) never even reaches a role check, since `'operator'` isn't in `create_machine`'s own `allowed_roles`, and returns a real `401` immediately.
- `r_wrong_role = client.post("/api/machines", json=body, headers={"Authorization": f"Bearer {quality_token}"})` — Sends the identical real body, this time with a real, valid token - `token_required`'s own real code decodes it, finds the real user, and only THEN checks the real role (`auth_utils.py:472`), returning a real `403` because `'quality'` isn't in `['programming', 'admin']`.
- `assert r_no_token.status_code == 401 / assert r_wrong_role.status_code == 403` — Confirms both real, distinct outcomes - one real rejection before identity was ever established, one real rejection after it was.

### CS Lens

This is **authentication versus authorization**: two genuinely separate real questions - "who is this" and "is this specific identity allowed to do this specific thing" - checked in that order. Also recognized in: a building's own real keycard system (a card that doesn't scan at all versus a card that scans fine but doesn't open this particular door); a database's own real connection authentication versus its per-table `GRANT` permissions; and, in this project's own domain, a shop-floor badge that either doesn't register at all, or registers fine but isn't cleared for a specific machine.

### SE Lens

The design principle is checking identity BEFORE permission, because permission is meaningless without a real identity to check it against - exactly the real order `token_required`'s own code follows, proven directly by this unit's own two calls. The real alternative not chosen: collapsing both into one generic real "access denied" response, which would be simpler to implement but would cost a caller real, useful information - proven directly by this unit's own two, genuinely different real status codes: a `401` tells a caller "go get real credentials," while a `403` tells them "your real credentials are fine, this specific action just isn't permitted" - two different real fixes for two different real problems.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_status_401_403.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
no Authorization header at all -> status: 401 body: {'code': 'TOKEN_MISSING', 'error': 'Authentication token required', 'path': '/api/machines'}
real, valid token, but role 'quality' not in allowed_roles -> status: 403 body: {'code': 'UNAUTHORIZED_ROLE', 'error': 'Role quality not authorized for this action'}
401 means 'I don't know who you are'; 403 means 'I know exactly who you are, and the answer is still no'
```

Full saved run: `verification/phase-03/lab_status_401_403_output.txt`.

### Connection to the previous unit

The previous unit showed one real code hiding two genuinely different problems; this unit shows the opposite - two genuinely different real codes for two genuinely different real reasons, correctly kept apart.

## Concept Unit: 404 vs 409 - Doesn't Exist vs Already Exists

### The Problem

`get_machine`'s own real code returns `404` for an ID that isn't there; `create_machine`'s own real code also returns a `4xx` for an ID that already IS there (`machines.py:135-137`). Are those the same real kind of problem, pointed in opposite directions?

Before reading on:

- A `404` means the resource this URL names genuinely doesn't exist. A duplicate-ID creation attempt means the OPPOSITE - a real resource with that identity already exists, and this request conflicts with it. Should those two real facts share a status code?
- HTTP has a real, distinct status code, `409`, specifically for a real conflict with existing state. Before reading below, would you expect `create_machine`'s own real code to use it for a duplicate ID?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:48-61` (`get_machine`) and `:135-137` (`create_machine`'s own duplicate check), both read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; a real `User` row with a `programming` role and token.

### The New Code

A real request for a resource that isn't there, next to a real request that conflicts with one that is:

**File:** `verification/phase-03/lab_status_404_409.py` (new)

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
    user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")
    db.session.add(machine)
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "programming")
    headers = {"Authorization": f"Bearer {token}"}
    client = app.test_client()

    r_missing = client.get("/api/machines/DOES-NOT-EXIST")
    print("GET a real, nonexistent machine -> status:", r_missing.status_code, "body:", r_missing.get_json())

    body = {"id": "M-TEST-001", "name": "Duplicate Mill", "category": "mill", "subType": "3_axis", "manufacturer": "Haas", "model": "VF-2"}
    r_duplicate = client.post("/api/machines", json=body, headers=headers)
    print("POST a machine whose real id already exists -> status:", r_duplicate.status_code, "body:", r_duplicate.get_json())

    assert r_missing.status_code == 404
    assert r_duplicate.status_code == 400
    print("404 means the resource genuinely isn't there; the duplicate-id case IS a real conflict with an existing resource - HTTP's own real 409 exists for exactly this - but this project's own code returns 400 instead")
```

### Mechanical Walkthrough

- `r_missing = client.get("/api/machines/DOES-NOT-EXIST")` — Sends a real `GET` for an ID no real row uses - `get_machine`'s own real `if not machine:` branch returns `404`.
- `r_duplicate = client.post("/api/machines", json=body, headers=headers)` — Sends a real `POST` reusing the ID `"M-TEST-001"`, which already belongs to a real, existing machine - `create_machine`'s own real `if existing:` branch (`machines.py:136`) fires, returning `400` rather than the more specific real `409` this exact situation names.
- `assert r_missing.status_code == 404 / assert r_duplicate.status_code == 400` — Confirms both real outcomes - one genuine absence, one genuine conflict, and only one of the two gets a status code specific to what actually happened.

### CS Lens

This is **resource-state conflict versus resource-state absence**: two opposite real facts about a resource's own current existence. Also recognized in: a filesystem's own real `ENOENT` (no such file) versus `EEXIST` (file already exists) - genuinely different real error codes for genuinely opposite problems; a version-control system's own real "branch not found" versus "branch already exists"; and, in this project's own domain, a real machine ID lookup failing because the machine was never registered, versus a new registration failing because that ID is already taken.

### SE Lens

The design principle real `409` exists for is naming a conflict with existing state as its own real category, distinct from both "malformed" (`400`) and "doesn't exist" (`404`) - useful because a caller handling a `409` might reasonably retry with a different ID, while a caller handling a generic `400` has no such specific real cue. The real alternative not chosen here, in this project's own code: using `409` for the duplicate-ID case, the way `create_machine`'s own real specimen (`machines.py:135-137`) is exactly what `409` was designed for; the honest cost of the `400` choice this project's own code actually makes: a caller's own error-handling code has to parse the real message string ("Machine ID already exists") to tell this case apart from a genuinely malformed request, rather than branching on a real, distinct status code.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_status_404_409.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
GET a real, nonexistent machine -> status: 404 body: {'error': 'Machine not found'}
POST a machine whose real id already exists -> status: 400 body: {'error': 'Machine ID already exists'}
404 means the resource genuinely isn't there; the duplicate-id case IS a real conflict with an existing resource - HTTP's own real 409 exists for exactly this - but this project's own code returns 400 instead
```

Full saved run: `verification/phase-03/lab_status_404_409_output.txt`.

### Connection to the previous unit

The previous unit contrasted two real reasons a request can be rejected before it even runs; this unit contrasts two real facts about a resource's own existence - and finds this project's own code, once again, doesn't give the more specific real case its own real code.

## Concept Unit: 500 - When the Server Itself Breaks

### The Problem

`get_machines`'s own real `?type=` filter (`machines.py:35-36`) has been a known, documented problem since earlier in this curriculum - but never actually triggered and observed directly. What does this project's own real code do when the server itself, not the request, is what's broken?

Before reading on:

- `Machine.type` is referenced in `get_machines`'s own real filter logic, but the real `Machine` model - checked directly against its own real, current source - has no column by that name. Before running anything, what real kind of Python error would you expect a nonexistent attribute access to raise?
- A `400` means the CLIENT sent something wrong. Is a `?type=3-axis` query string, by itself, actually malformed - or is the real problem entirely on the server's own side?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:14-45` (`get_machines`), read again this session, plus `backend/config.py:58-62` (`TestingConfig`), confirming this project's own real testing configuration never explicitly sets `PROPAGATE_EXCEPTIONS`.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; explicitly setting `app.config['PROPAGATE_EXCEPTIONS'] = False` after `create_app('testing')`, since this project's own real `TESTING` config otherwise lets the real exception propagate past Flask's own error handling entirely, rather than becoming a real `500` response a genuine client would ever see.

### The New Code

The real, already-documented crash, triggered and observed directly for the first time in this curriculum:

**File:** `verification/phase-03/lab_status_500.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
app.config["PROPAGATE_EXCEPTIONS"] = False
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", status="available")
    db.session.add(machine)
    db.session.commit()

    client = app.test_client()

    r = client.get("/api/machines?type=3-axis")
    print("GET /api/machines?type=3-axis -> status:", r.status_code)
    print("real body (truncated):", r.get_data(as_text=True)[:200])

    assert r.status_code == 500
    print("this project's own real, documented ?type= query filter crashes with an uncaught AttributeError - Machine has no 'type' column")
```

### Mechanical Walkthrough

- `app.config["PROPAGATE_EXCEPTIONS"] = False` — Set explicitly, after `create_app`, because this project's own real `TestingConfig` (`config.py:58-62`) leaves this flag unset - and Flask's own real default, when `TESTING=True`, is to let an exception propagate all the way out rather than convert it into a real `500` response. Without this line, a genuine caller would never even see a `500` here; the whole real connection would simply fail.
- `r = client.get("/api/machines?type=3-axis")` — Sends a real request with the real, documented `?type=` query parameter - `get_machines`'s own real code (`machines.py:35-36`) runs `Machine.type`, a real attribute access on a class with no such real attribute, raising a genuine `AttributeError` mid-request.
- `print("real body (truncated):", r.get_data(as_text=True)[:200])` — Shows the real body a genuine caller would actually receive - Flask's own generic, real `500` HTML page, not this project's own JSON error shape every other route in this lesson used.
- `assert r.status_code == 500` — Confirms, for real, that this project's own already-documented problem is not merely a hypothetical - a real request against this project's own real, running code produces a genuine `500`.

### CS Lens

This is a **server-side failure**: an error the server itself never anticipated, arising from its own real code rather than anything wrong with the request. Also recognized in: a compiled program's own real segmentation fault (the input was fine; the program's own logic wasn't); a database driver's own real "column does not exist" error, when a query references real schema that changed out from under it; and, in this project's own domain, a machine control faulting mid-cycle because of its own internal fault, not because the operator entered anything wrong.

### SE Lens

The design principle a real `500` exists to preserve is honesty: telling a caller "this is our fault, not yours" rather than forcing a `4xx` onto a problem the request itself didn't cause. The real alternative this project's own code does NOT implement here: a real `try`/`except` around the `Machine.type` filter, converting this into a real, non-crashing response (even a `400` explaining the filter isn't supported would be more honest than a raw crash); the honest cost, proven directly by this unit's own real run: this exact, real, already-known gap has sat undetected in this project's own code specifically because nothing in this curriculum had triggered it directly until this unit did.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_status_500.py` — Runs this as a plain script, from the repository root.

### Verification

```text
[2026-08-31 05:05:39,750] ERROR in app: Exception on /api/machines [GET]
Traceback (most recent call last):
  File "C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Lib\site-packages\flask\app.py", line 1455, in wsgi_app
    response = self.full_dispatch_request()
  File "C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Lib\site-packages\flask\app.py", line 869, in full_dispatch_request
    rv = self.handle_user_exception(e)
  File "C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Lib\site-packages\flask_cors\extension.py", line 176, in wrapped_function
    return cors_after_request(app.make_response(f(*args, **kwargs)))
  File "C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Lib\site-packages\flask\app.py", line 867, in full_dispatch_request
    rv = self.dispatch_request()
  File "C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Lib\site-packages\flask\app.py", line 852, in dispatch_request
    return self.ensure_sync(self.view_functions[rule.endpoint])(**view_args)
  File "C:\Users\g4m3r\Documents\manufacturing-platform\backend\app\utils\auth_utils.py", line 424, in decorated
    return f(None, *args, **kwargs)
  File "C:\Users\g4m3r\Documents\manufacturing-platform\backend\app\routes\machines.py", line 36, in get_machines
    query = query.filter(Machine.type == machine_type)
AttributeError: type object 'Machine' has no attribute 'type'
Seeding default users...
GET /api/machines?type=3-axis -> status: 500
real body (truncated): <!doctype html>
<html lang=en>
<title>500 Internal Server Error</title>
<h1>Internal Server Error</h1>
<p>The server encountered an internal error and was unable to complete your request. Either the s
this project's own real, documented ?type= query filter crashes with an uncaught AttributeError - Machine has no 'type' column
```

Full saved run: `verification/phase-03/lab_status_500_output.txt`.

### Connection to the previous unit

Every earlier unit in this lesson contrasted two real `4xx` codes for two real, different client-side problems; this last unit closes on the one real code family where the client did nothing wrong at all - the server's own code is what broke.

## Connect the pieces

One real machine, run through every real status code family this lesson studies. A real `GET`, a real `POST`, and a real `DELETE`, all succeeding with three different real `2xx` codes - `200`, `201`, and `200` again, since this project's own code never reaches for `204`. Two real, different problems with `update_machine_status`'s own body - one missing, one invalid - both landing on the identical real `400`. Two real rejections from `create_machine` - one before any real identity was established (`401`), one after (`403`) - correctly kept apart. A real absence (`404`) and a real conflict that HTTP's own `409` exists for, both reaching `create_machine`'s own code, only one of them getting a status code specific to what actually happened. And, last, the one real code family with nothing to do with the request at all: `get_machines`'s own real, already-known `?type=` crash, triggered directly for the first time and producing a genuine `500` - this project's own server, not this project's own caller, at fault.

**Next lesson:** Every status code this lesson studied came wrapped in a real JSON body, taken for granted; next, this curriculum studies the real headers riding alongside every one of these requests and responses - what each one actually promises, and which ones this project's own real code already depends on.