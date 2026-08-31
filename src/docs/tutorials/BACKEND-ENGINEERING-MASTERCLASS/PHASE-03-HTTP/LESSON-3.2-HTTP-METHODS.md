# Lesson 3.2: HTTP Methods

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Five real, run checks against this project's own real `backend/app/routes/machines.py` routes, one per HTTP method - `GET`, `POST`, `PUT`, `PATCH`, `DELETE` - each proving a real, defining property of that method (safety, idempotency, who decides a new resource's identity), and along the way, independently discovering a real, previously-undocumented gap in this project's own `update_machine`: it registers both `PUT` and `PATCH` on the identical route, through the identical function, with zero `request.method` branching - so a real `PUT` request here never actually gets true full-replacement semantics; it silently gets `PATCH`'s own partial-merge behavior instead.

**What you need to know first:** What a client and a server are, and what a real HTTP request and response actually look like; what a Flask view function is and how a route's own `methods` list decides which real requests reach it; what a decorator wrapping a view function can do before that function's own body runs.

## Terms used in this lesson

- **GET** — The real HTTP method naming a request as "read this resource, change nothing" - this lesson's own first unit calls it against this project's own real `/api/machines`. It exists as the one method every real HTTP client, cache, and proxy is allowed to assume causes no real side effects at all, without having to inspect what the request actually does.
- **POST** — The real HTTP method naming a request as "create something new, at a real identity the server itself decides" - this lesson's own second unit calls it against this project's own real `/api/machines/groups`. It exists for exactly the case a client doesn't yet know, and can't supply, the real identity of the thing it's asking to create.
- **PUT** — The real HTTP method naming a request as "this is now the complete, real state of this resource" - a full replacement, at a real identity the CLIENT already names in the URL. It exists so a client that already knows exactly what a resource should look like can say so in one real request, and safely repeat that same real request without changing the outcome.
- **PATCH** — The real HTTP method naming a request as "apply this real, partial change, leaving everything else alone" - this lesson's own fourth unit calls it against the identical real route its `PUT` unit used. It exists for the real, common case where a client wants to change one specific real fact about a resource without having to first know, and resend, every other real fact about it.
- **DELETE** — The real HTTP method naming a request as "this resource should no longer exist" - this lesson's own last unit calls it against this project's own real `/api/machines/<id>`. It exists as its own named method, distinct from an update, because "this resource is gone" is a real, different kind of change than any modification to its content.
- **safe (HTTP method property)** — The real property that a method's own definition promises zero side effects on the server - calling it changes nothing, no matter how many real times it's called. It exists so real tooling (browsers prefetching a link, a proxy caching a response) can treat a safe method specially, without ever having to inspect what a specific real route actually does.
- **idempotency** — The real property that calling a method N real times, with the identical real request, leaves the resource in exactly the same real end state as calling it once - a claim about the real state afterward, not about whether every real response looks identical. It exists so a real client, uncertain whether a request actually reached the server (a real timeout, a dropped connection), can safely resend it without worrying about doing something twice.

## Objects and methods used

- **`FlaskClient (.get / .post / .put / .patch / .delete)`**
  - *What it is:* The real test client this project's own `app.test_client()` returns - the same real class this curriculum has already used, here calling all five real HTTP methods this lesson studies.
  - *Implementation:* `.get(path)`, `.post(path, json=...)`, `.put(path, json=...)`, `.patch(path, json=...)`, and `.delete(path)` are five real methods on `FlaskClient`, each simulating a real HTTP request of that exact method against the given path - the same real client object is reused across this lesson's own repeated calls in every unit.
  - *Its use:* This lesson calls a different one of these five real methods in each of its own units, always against this project's own real routes, specifically to observe each method's own real, defining behavior in isolation.
  - *Type:* Five real instance methods on `FlaskClient`, one per real HTTP method.
  - *Responsibility:* Simulating a real, complete HTTP request of one specific real method - never letting a caller send a `GET` and get `POST`'s own real behavior by mistake.
  - *Depends on:* A fully-built `Flask` app instance; a real path; an optional real JSON body and headers dict.
  - *Connects to:* Every real request in this lesson goes through exactly one of these five methods; each real call reaches this project's own real routing the same way a genuine external client's request would.
  - *Shape:* Takes a real path (and optional body/headers) in; returns one real `Response` object out, the same real class this curriculum has already inspected.

- **`get_machines`**
  - *What it is:* A real, existing Flask view function listing every machine in the database.
  - *Implementation:* `@machines_bp.route('', methods=['GET'])` `def get_machines(current_user): ...` (`backend/app/routes/machines.py:14-45`) - reads optional real query-string filters, queries `Machine.query`, orders the real results by name, and returns a real, `jsonify`-wrapped list - never calling `db.session.add` or `db.session.commit` anywhere in its own body.
  - *Its use:* This lesson calls it twice, back to back, with no change to the database in between, specifically to check whether two real calls produce two real, identical results.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Reading and returning every real machine currently in the database, filtered if the request asks - with no real side effect of its own, ever.
  - *Depends on:* Zero or more real query-string filters; the real rows already in the database.
  - *Connects to:* Wrapped by `token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])`, which runs first on every real request.
  - *Shape:* Reads real, optional query parameters in (via `request.args.get`); returns a real, `jsonify`-wrapped dict with an implicit `200`.

- **`create_machine_group`**
  - *What it is:* A real, existing Flask view function creating a new machine group.
  - *Implementation:* `@machines_bp.route('/groups', methods=['POST'])` `def create_machine_group(current_user): ...` (`backend/app/routes/machines.py:214-254`) - builds a real `group_id` from `data['name']` (never from anything the client supplies as an ID), then runs a real `while MachineGroup.query.get(group_id): ...` loop, appending an incrementing real counter until it lands on a real ID that doesn't already exist, before committing a real new `MachineGroup` row.
  - *Its use:* This lesson calls it twice, with the identical real body, to check what the real, existing `group_id` this route generates does to a second, colliding real attempt.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Creating exactly one real `MachineGroup` row, with a real, server-generated ID that is guaranteed unique at the moment of creation.
  - *Depends on:* A real, valid JSON body containing at least `'name'`; the real `MachineGroup` rows already in the database, to check against for a real collision.
  - *Connects to:* Wrapped by `token_required(allowed_roles=['programming', 'admin'])`, which runs first on every real request.
  - *Shape:* Reads a real dict in (from `request.get_json()`); returns a real, `jsonify`-wrapped dict with an explicit `201` on success.

- **`update_machine`**
  - *What it is:* A real, existing Flask view function updating an existing machine's fields - the real specimen this lesson's own `PUT` and `PATCH` units both call, against the identical real route.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>', methods=['PUT', 'PATCH'])` `def update_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:172-211`) - looks up a real `Machine` by `machine_id`, returns `404` if it doesn't exist, then runs a real sequence of `if 'name' in data: machine.name = data['name']` checks, one per real field, before committing - never once reading or branching on `request.method` anywhere in its own body, despite being registered for two real, different methods.
  - *Its use:* This lesson calls it once as a real `PUT` and once as a real `PATCH`, with the identical real, partial body each time, specifically to check whether this route's own real behavior actually differs between the two.
  - *Type:* A Flask view function, decorated with `@token_required`, registered for two real HTTP methods at once.
  - *Responsibility:* Applying whatever real fields a request body actually names to an existing `Machine` row, and leaving every other real field untouched - regardless of which of its two registered real methods a given request arrived as.
  - *Depends on:* A real, existing `Machine` row; a real JSON body; `token_required`'s own real decision about whether this specific request is allowed through at all.
  - *Connects to:* Wrapped by `token_required(allowed_roles=['programming', 'admin'])`; registered for both `PUT` and `PATCH`, so Werkzeug's own real routing sends requests of either real method to this identical function.
  - *Shape:* Reads a real dict in (from `request.get_json()`); returns a real, `jsonify`-wrapped dict with an implicit `200` on success, or a real `404`/`500` error dict otherwise.

- **`delete_machine`**
  - *What it is:* A real, existing Flask view function deleting a machine from the database.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>', methods=['DELETE'])` `def delete_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:274-297`) - looks up a real `Machine` by `machine_id`, returns a real `404` if it doesn't exist, otherwise calls `db.session.delete(machine)` and commits, returning a real `{'success': True, ...}` body.
  - *Its use:* This lesson calls it twice, on the identical real ID, specifically to observe what its own real `404` branch does the second time, once the row genuinely no longer exists.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Removing exactly one real `Machine` row, if it still exists, and reporting plainly if it doesn't.
  - *Depends on:* A real `machine_id` matched from the request URL; the real row's current, real existence in the database.
  - *Connects to:* Wrapped by `token_required(allowed_roles=['admin'])`; its own real `if not machine:` branch is exactly what this lesson's own second real call exercises.
  - *Shape:* Takes a real `machine_id` string in (from the URL); returns a real, `jsonify`-wrapped `{'success': bool, ...}` dict, with an implicit `200` or an explicit `404`.

## Concept Unit: GET - Safe, No Matter How Many Times

### The Problem

This lesson's first real specimen needs to show nothing changing as a result of asking. What would it actually mean for an HTTP method to be safe to call, even by accident, even many real times?

Before reading on:

- `get_machines`'s own real code (`machines.py:14-45`) never calls `db.session.add`, `db.session.commit`, or anything else that writes to the database - only reads. Given that, what would you expect to be true about calling it twice in a row, back to back, with nothing else happening in between?
- If a method genuinely never changes anything, is there a real difference, to the database, between calling it once and calling it a hundred times?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:14-45` (`get_machines`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row, the same real specimen this curriculum has already built.

### The New Code

The identical real `GET` request, sent twice, with nothing changing the database in between:

**File:** `verification/phase-03/lab_http_get.py` (new)

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

    r1 = client.get("/api/machines")
    r2 = client.get("/api/machines")

    print("call 1 -> status:", r1.status_code, "body:", r1.get_json())
    print("call 2 -> status:", r2.status_code, "body:", r2.get_json())

    assert r1.get_json() == r2.get_json()
    print("two real, separate GET calls returned byte-identical bodies - nothing changed as a result of asking")
```

### Mechanical Walkthrough

- `client = app.test_client()` — Builds one real `FlaskClient`, reused for both of this unit's real requests - this lesson's own first construction of it; every later unit in this lesson builds its own fresh one the same way.
- `r1 = client.get("/api/machines")` — Sends the first real `GET` request - `get_machines`'s own real code runs a real, read-only query and returns exactly what it finds, with no real write of any kind.
- `r2 = client.get("/api/machines")` — Sends a second, separate real request, to the identical real URL, with nothing in between that could have changed the database's own real state.
- `assert r1.get_json() == r2.get_json()` — Confirms both real calls returned the identical real body - the direct, verified proof that asking twice cost nothing real and changed nothing real.

### CS Lens

This is a **safe method**: a real guarantee of zero side effects, checkable by a caller without ever reading the route's own real implementation. Also recognized in: SQL's own `SELECT` statement (never mutates a row); a pure function, which always returns the same real output for the same real input with no observable effect elsewhere; HTTP caching's entire real premise (a response can only be safely cached because the request that produced it is safe); and, in this project's own domain, a quality inspection measurement - measuring a real part's dimension doesn't change the part.

### SE Lens

The design principle is that restricting one real method to "guaranteed no side effects" lets real tooling - a browser prefetching a link, a proxy caching a response, a monitoring script retrying a failed check - treat that method specially, without first inspecting what a specific real route actually does. The real alternative not chosen - allowing any method to carry side effects, decided route by route - is exactly what would break that guarantee; the honest cost this project's own real code still carries: nothing in Flask's own routing actually *enforces* safety - a route registered for `GET` could call `db.session.commit()` just as easily as `get_machines` calls `db.session.query(...)`, and nothing would stop it. This is a real convention this project's own code happens to follow, not something the framework verifies for it.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_get.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
call 1 -> status: 200 body: {'data': [{'axes': 3, 'category': 'mill', 'createdAt': '2026-08-31T08:57:12.899752', 'currentOperatorClientId': None, 'currentPartId': None, 'groupId': None, 'hasToolChanger': False, 'id': 'M-TEST-001', 'location': None, 'manufacturer': None, 'maxSpindleSpeed': None, 'model': None, 'name': 'Test Mill', 'operatorLastHeartbeatAt': None, 'serialNumber': None, 'spindleTaper': None, 'status': 'available', 'subType': '3_axis', 'toolChangerCapacity': None, 'updatedAt': '2026-08-31T08:57:12.899754', 'xTravel': None, 'yTravel': None, 'zTravel': None}], 'total': 1}
call 2 -> status: 200 body: {'data': [{'axes': 3, 'category': 'mill', 'createdAt': '2026-08-31T08:57:12.899752', 'currentOperatorClientId': None, 'currentPartId': None, 'groupId': None, 'hasToolChanger': False, 'id': 'M-TEST-001', 'location': None, 'manufacturer': None, 'maxSpindleSpeed': None, 'model': None, 'name': 'Test Mill', 'operatorLastHeartbeatAt': None, 'serialNumber': None, 'spindleTaper': None, 'status': 'available', 'subType': '3_axis', 'toolChangerCapacity': None, 'updatedAt': '2026-08-31T08:57:12.899754', 'xTravel': None, 'yTravel': None, 'zTravel': None}], 'total': 1}
two real, separate GET calls returned byte-identical bodies - nothing changed as a result of asking
```

Full saved run: `verification/phase-03/lab_http_get_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the simplest real method as a baseline every later unit's own method is measured against.

## Concept Unit: POST - Not Idempotent, the Server Decides Identity

### The Problem

`create_machine_group`'s own real code (`machines.py:214-254`) builds its own `group_id` from `data['name']`, rather than reading an ID the client supplies. What does that suggest happens if the identical real request is sent twice?

Before reading on:

- If two real requests carry the exact same real body, and the second one arrives to find the first real `group_id` already taken, what does this route's own real `while MachineGroup.query.get(group_id): ...` loop (`machines.py:235-237`) actually do about that?
- Contrast this with a route that reads a resource's real ID straight out of the URL, the way `update_machine`'s own real `machine_id` does. Which one lets the CLIENT decide a resource's real identity, and which lets the SERVER decide it?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:214-254` (`create_machine_group`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `User` row with a real `programming` role; a real, valid token from `encode_auth_token`.

### The New Code

The identical real `POST` request, sent twice:

**File:** `verification/phase-03/lab_http_post.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "programming")
    headers = {"Authorization": f"Bearer {token}"}
    client = app.test_client()

    body = {"name": "CNC Mills"}

    r1 = client.post("/api/machines/groups", json=body, headers=headers)
    r2 = client.post("/api/machines/groups", json=body, headers=headers)

    print("call 1 (body:", body, ") -> status:", r1.status_code, "id:", r1.get_json()["data"]["id"])
    print("call 2 (identical body) -> status:", r2.status_code, "id:", r2.get_json()["data"]["id"])

    assert r1.status_code == 201
    assert r2.status_code == 201
    assert r1.get_json()["data"]["id"] != r2.get_json()["data"]["id"]
    print("the identical real request, sent twice, created two real, distinct resources")
```

### Mechanical Walkthrough

- `user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")` — Builds one real `User` row with a real `programming` role - this lesson's own first appearance of a real, authenticated request; unlike `get_machines`, `create_machine_group`'s own `allowed_roles=['programming', 'admin']` never includes `'operator'`, so no real credentials means no real access at all here.
- `token = encode_auth_token("U-TEST-001", "programming")` — Produces one real, valid, signed token for that real user - passed as a real `Authorization` header on both of this unit's own requests.
- `r1 = client.post("/api/machines/groups", json=body, headers=headers)` — Sends the first real `POST` - `create_machine_group`'s own real code builds `group_id = "GRP-CNC-MILLS"` from `body['name']`, finds no existing real row with that ID, and commits it as is.
- `r2 = client.post("/api/machines/groups", json=body, headers=headers)` — Sends the identical real body a second time - `create_machine_group`'s own real code builds the same real starting `group_id`, but this time `MachineGroup.query.get(group_id)` finds the row from the first call, so its own real loop appends `-1`, producing a genuinely different real ID.
- `assert r1.get_json()["data"]["id"] != r2.get_json()["data"]["id"]` — Confirms, for real, that two identical real requests produced two real, distinct resources - the direct opposite of the previous unit's own `GET` result.

### CS Lens

This is **non-idempotent creation**: a real operation whose own identity-assignment logic - a real `while` loop that keeps incrementing until it finds a free ID - is built to keep producing a genuinely new real result no matter how many times it runs, proven directly by this unit's own two real, back-to-back calls. Also recognized in: a SQL table's own `AUTO_INCREMENT` primary key (each real `INSERT` gets a new key, even with identical column values); a factory function allocating a genuinely new real object on every call; a ticket-queue system handing out a new real ticket number per request; and, in this project's own domain, physically stamping a new real serial number onto each part run off a line, even from the identical real CAM program.

### SE Lens

The design principle is that letting the SERVER assign a real identity, rather than requiring the client to invent a unique one, removes an entire category of real coordination problem - two clients racing to pick the same ID. The real alternative not chosen here - a client-supplied ID, the way `update_machine`'s own URL-based `machine_id` works - would make a real retry safe (send the same ID twice, get the same real resource back), but requires the client to already know how to generate a real, collision-free ID itself; the honest cost this project's own code pays for choosing server-assigned IDs instead, proven directly by this unit's own two real calls: a client legitimately retrying a failed `POST` (after a real, uncertain network timeout) has no safe way to avoid creating a genuine, real duplicate group.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_post.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
call 1 (body: {'name': 'CNC Mills'} ) -> status: 201 id: GRP-CNC-MILLS
call 2 (identical body) -> status: 201 id: GRP-CNC-MILLS-1
the identical real request, sent twice, created two real, distinct resources
```

Full saved run: `verification/phase-03/lab_http_post_output.txt`.

### Connection to the previous unit

The previous unit's own real `GET` calls proved that asking twice changes nothing; this unit's own real `POST` calls prove the exact opposite - the identical real request, sent twice, genuinely changes the database twice.

## Concept Unit: PUT - Full Replacement, Meant to Be Idempotent

### The Problem

`update_machine`'s own real code (`machines.py:172-211`) is reachable by a real `PUT` request. HTTP's own real definition of `PUT` means replacing a resource's entire real representation with exactly what the request body contains. Does this route's own real code actually do that?

Before reading on:

- If `PUT` is supposed to mean "this is now the complete state of the resource," what would you expect to happen to a real field like `manufacturer`, if a real `PUT` request's own body never mentions it at all?
- `update_machine`'s own real code (`machines.py:188` onward) is a sequence of real `if 'name' in data: machine.name = data['name']` checks - one per field. Does that real structure match "replace everything," or something else?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:172-211` (`update_machine`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row with real `manufacturer`/`model` values already set; a real `User` row and token.

### The New Code

The identical real `PUT` request, sent twice, naming only one real field:

**File:** `verification/phase-03/lab_http_put.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", manufacturer="Haas", model="VF-2", status="available")
    user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")
    db.session.add(machine)
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "programming")
    headers = {"Authorization": f"Bearer {token}"}
    client = app.test_client()

    r_full = client.put("/api/machines/M-TEST-001", json={"status": "running"}, headers=headers)
    after_first = r_full.get_json()["data"]
    print("PUT #1, body {'status': 'running'} -> manufacturer:", after_first["manufacturer"], "model:", after_first["model"], "status:", after_first["status"])

    r_second = client.put("/api/machines/M-TEST-001", json={"status": "running"}, headers=headers)
    after_second = r_second.get_json()["data"]
    print("PUT #2, identical body -> manufacturer:", after_second["manufacturer"], "model:", after_second["model"], "status:", after_second["status"])

    assert after_first == after_second
    assert after_first["manufacturer"] == "Haas"
    assert after_first["model"] == "VF-2"
    print("real PUT semantics would replace the whole resource - but manufacturer and model, never mentioned in either body, survived both calls unchanged")
```

### Mechanical Walkthrough

- `r_full = client.put("/api/machines/M-TEST-001", json={"status": "running"}, headers=headers)` — Sends a real `PUT` request naming only `'status'` - `update_machine`'s own real field-by-field checks apply just that one real assignment, leaving every other real column exactly as it already was.
- `after_first = r_full.get_json()["data"]; print(..., after_first["manufacturer"], after_first["model"], ...)` — Reads back the real, updated row - `manufacturer` and `model`, never mentioned in the real body, are still `Haas` and `VF-2`, not cleared or reset to anything.
- `r_second = client.put("/api/machines/M-TEST-001", json={"status": "running"}, headers=headers)` — Sends the identical real `PUT` request a second time - `PUT`'s own real, defining idempotency claim: the same real request should produce the same real end state.
- `assert after_first == after_second` — Confirms real idempotency held - two identical real `PUT` calls left the resource in the identical real state, exactly as `PUT`'s own real definition promises.
- `assert after_first["manufacturer"] == "Haas" / assert after_first["model"] == "VF-2"` — Confirms the real, honest finding this unit exists to surface: fields never mentioned in either real `PUT` body were never cleared - real proof this route does not actually implement full replacement.

### CS Lens

This is **full replacement, meant to be idempotent**: the entire real resource is supposed to equal the request body, nothing carried over from before by assumption. Also recognized in: a configuration file's own full overwrite (replacing the entire real file content, not merging into it); an infrastructure-as-code `apply` that fully reconciles declared real state rather than appending to what's already there; a spreadsheet cell's own "replace with this formula" versus an incremental edit; and, in this project's own domain, re-flashing a machine control's entire real parameter set from a saved backup, rather than adjusting one value.

### SE Lens

The real design principle `PUT` commits to is that an idempotent full replacement makes retrying always safe - resending it after a real, uncertain network failure just re-establishes the identical real end state, proven directly by this unit's own two identical calls producing byte-identical results. The real alternative this project's own code does NOT implement: true full-replace `PUT` semantics would require treating an omitted field as "clear it" (or rejecting an incomplete real body outright) - the honest cost, proven directly by this unit's own real run: `update_machine`'s actual code never does that; `manufacturer` and `model`, never mentioned in either real `PUT` body, survived both calls completely unchanged. This route's real `PUT` handling doesn't implement real `PUT` semantics at all - it implements the same partial-merge behavior the next unit's own `PATCH` request gets, on the identical real route.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_put.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
PUT #1, body {'status': 'running'} -> manufacturer: Haas model: VF-2 status: running
PUT #2, identical body -> manufacturer: Haas model: VF-2 status: running
real PUT semantics would replace the whole resource - but manufacturer and model, never mentioned in either body, survived both calls unchanged
```

Full saved run: `verification/phase-03/lab_http_put_output.txt`.

### Connection to the previous unit

The previous unit's own real `POST` calls showed a method that is never idempotent by design; this unit's own real `PUT` calls show a method that is supposed to be idempotent - and are, in end state - while also surfacing a real gap in what "replacement" actually means here.

## Concept Unit: PATCH - Partial Update, By Design

### The Problem

The previous unit's own real `PUT` request left `manufacturer` and `model` untouched - not because it asked to, but because `update_machine`'s own real code always works that way. What does a method actually FOR partial updates look like, when it's the intended real semantic rather than an accident?

Before reading on:

- `update_machine`'s own real route registration is `methods=['PUT', 'PATCH']` (`machines.py:172`) - the exact same real function serves both. Given that, what would you expect to be different about calling it with a real `PATCH` instead of a real `PUT`?
- If nothing in `update_machine`'s own real code ever reads `request.method`, what does that tell you about whether this project's own real `PATCH` support is a deliberate, purpose-built implementation, or a side effect of `PUT` already existing on the same route?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:172-211` (`update_machine`) - the identical real function this lesson's own previous unit already used, read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row with real `manufacturer`/`model` values already set; a real `User` row and token.

### The New Code

A real `PATCH` request, naming only one real field, against the identical real route the previous unit's `PUT` request used:

**File:** `verification/phase-03/lab_http_patch.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", manufacturer="Haas", model="VF-2", status="available")
    user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")
    db.session.add(machine)
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "programming")
    headers = {"Authorization": f"Bearer {token}"}
    client = app.test_client()

    r = client.patch("/api/machines/M-TEST-001", json={"status": "maintenance"}, headers=headers)
    data = r.get_json()["data"]

    print("PATCH, body {'status': 'maintenance'} -> status:", r.status_code)
    print("real, updated fields:", "status:", data["status"])
    print("real, untouched fields:", "manufacturer:", data["manufacturer"], "model:", data["model"], "category:", data["category"])

    assert data["status"] == "maintenance"
    assert data["manufacturer"] == "Haas"
    assert data["model"] == "VF-2"
    print("only the one real field named in the body changed - every other real field was left exactly as it was")
```

### Mechanical Walkthrough

- `r = client.patch("/api/machines/M-TEST-001", json={"status": "maintenance"}, headers=headers)` — Sends a real `PATCH` request naming only `'status'` - reaches the identical real `update_machine` function the previous unit's `PUT` call reached, since Werkzeug's own real routing sends both real methods to the same registered function.
- `data["status"] == "maintenance"` — Confirms the one real field this request actually named was genuinely applied.
- `data["manufacturer"] == "Haas" / data["model"] == "VF-2"` — Confirms every other real field survived untouched - the correct, real, intended meaning of a partial update.

### CS Lens

This is a **partial update**: a real operation naming only what genuinely changed, leaving everything else alone by design. Also recognized in: a SQL `UPDATE ... SET status = 'x' WHERE id = 'y'` statement (touches one real column, leaves every other real column value exactly as it was); a version-control merge applying only the real lines that actually changed, not the whole real file; a spreadsheet's own single-cell edit; and, in this project's own domain, changing one real dimension on a part's routing without re-entering the entire real route.

### SE Lens

The real design principle `PATCH` commits to is deliberate partial application - name only what changed, leave the rest alone - which is exactly, verifiably what this unit's own run shows. The honest, real finding this lesson's own `PUT` and `PATCH` units together prove: `update_machine`'s real `@machines_bp.route(..., methods=['PUT', 'PATCH'])` (`machines.py:172`) registers the identical function for both, with zero `request.method` branching anywhere in its real body - so this project's own real `PATCH` support isn't a separate, deliberate implementation of partial-update semantics; it's the SAME real code the previous unit's own `PUT` request ran, meaning this route's real `PUT` handling silently behaves like `PATCH`, every single time, regardless of which real method a caller actually sends. The real alternative this project did not build - checking `request.method` and, for a genuine `PUT`, resetting every field the body doesn't mention - is what true HTTP `PUT` semantics would require; the honest cost of the version this project actually shipped: a client sending a real, spec-correct `PUT` (intending to fully replace a machine's record) can never actually clear a stale real field through this route at all.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_patch.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
PATCH, body {'status': 'maintenance'} -> status: 200
real, updated fields: status: maintenance
real, untouched fields: manufacturer: Haas model: VF-2 category: mill
only the one real field named in the body changed - every other real field was left exactly as it was
```

Full saved run: `verification/phase-03/lab_http_patch_output.txt`.

### Connection to the previous unit

The previous unit's own real `PUT` request left every unmentioned field untouched, and called that a gap; this unit's own real `PATCH` request does the identical real thing, against the identical real route, and it's exactly correct - the two units together prove this project's own code can't actually tell the difference between the two real methods at all.

## Concept Unit: DELETE - Idempotent by End State, Not by Response

### The Problem

`delete_machine`'s own real code (`machines.py:274-297`) returns a real `404` if the machine doesn't exist. If `DELETE` is supposed to be idempotent, does returning a DIFFERENT real status code on a second real call break that?

Before reading on:

- HTTP's own real idempotency definition is about a resource's real END STATE after N identical real calls, not about whether every real response looks identical. Given that, does a real `200`-then-`404` sequence violate idempotency, or satisfy it?
- After `delete_machine`'s own real code successfully deletes a machine, what real, physical fact makes a second real `DELETE` call to the same URL fail - is it something the route itself decided, or a real, structural consequence of the first call already having run?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:274-297` (`delete_machine`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; a real `User` row with a real `admin` role and token.

### The New Code

The identical real `DELETE` request, sent twice, followed by an independent real database check:

**File:** `verification/phase-03/lab_http_delete.py` (new)

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
    headers = {"Authorization": f"Bearer {token}"}
    client = app.test_client()

    r1 = client.delete("/api/machines/M-TEST-001", headers=headers)
    print("DELETE #1 -> status:", r1.status_code, "body:", r1.get_json())

    r2 = client.delete("/api/machines/M-TEST-001", headers=headers)
    print("DELETE #2 (same id, already gone) -> status:", r2.status_code, "body:", r2.get_json())

    still_there = db.session.get(Machine, "M-TEST-001")
    print("real row after both calls:", still_there)

    assert r1.status_code == 200
    assert r2.status_code == 404
    assert still_there is None
    print("two different real status codes, but the same real end state both times: the machine is gone")
```

### Mechanical Walkthrough

- `r1 = client.delete("/api/machines/M-TEST-001", headers=headers)` — Sends the first real `DELETE` - `delete_machine`'s own real code finds the row, calls `db.session.delete(machine)`, and commits, returning a real `200` with `success: True`.
- `r2 = client.delete("/api/machines/M-TEST-001", headers=headers)` — Sends the identical real request again - `Machine.query.get(machine_id)` now finds nothing, since the row was really deleted a moment ago, so `delete_machine`'s own real `if not machine:` branch returns a real `404` this time instead.
- `still_there = db.session.get(Machine, "M-TEST-001")` — An independent, real, fresh query, deliberately separate from either response - confirms the real end state directly, rather than trusting either call's own response body.
- `assert r1.status_code == 200 / assert r2.status_code == 404 / assert still_there is None` — Confirms all three real, distinct facts together: two genuinely different real status codes, and one identical real end state underneath both of them.

### CS Lens

This is **idempotent by end state**: repeated real calls converge on, and stay at, the identical real outcome, even when their own real responses differ. Also recognized in: running `rm` on an already-deleted real file (the second call errors, but the real filesystem's own end state - the file's absence - is identical either way); a SQL `DELETE ... WHERE id = 'y'` statement matching zero real rows on a second run (`0` rows affected, but the identical real end state); a light switch already off staying off no matter how many more times "turn it off" is asked; and, in this project's own domain, retracting a tool that's already retracted.

### SE Lens

The design principle is that idempotency is a claim about STATE, not about RESPONSE UNIFORMITY - exactly what this unit's own two real, different status codes (`200`, then `404`) prove without any contradiction. The real alternative not chosen here: some real APIs return a real `200`/`204` on every `DELETE` call regardless of whether a row was actually found, specifically to make automated retries simpler (no special-casing a `404`); the honest cost of the real `404`-on-second-call choice this project's own code makes: a caller retrying a `DELETE` after a real, uncertain network failure (not knowing whether the first one actually reached the server) has to treat a real `404` as a SUCCESS case too, not a real error - or it will incorrectly report failure for a delete that, in the real end state, already fully succeeded.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_delete.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
DELETE #1 -> status: 200 body: {'message': 'Machine Test Mill deleted', 'success': True}
DELETE #2 (same id, already gone) -> status: 404 body: {'error': 'Machine not found', 'success': False}
real row after both calls: None
two different real status codes, but the same real end state both times: the machine is gone
```

Full saved run: `verification/phase-03/lab_http_delete_output.txt`.

### Connection to the previous unit

Every earlier unit in this lesson checked a method's own behavior on a single real call, or across two calls with the same real body; this unit closes the lesson on the one real method whose own idempotency only makes sense once "the same real outcome" is allowed to mean "the same real state," not "the same real response."

## Connect the pieces

One real machine, run through all five real HTTP methods this lesson studies: a real `GET`, asked twice, changing nothing and returning byte-identical real bodies (safe). A real `POST`, sent twice with the identical real body, creating two real, distinct machine groups because the server, not the client, decides a new resource's real identity (not idempotent). A real `PUT`, sent twice with the identical real, partial body, landing on the identical real end state both times (idempotent, as promised) - while also proving, directly, that this route's own real code never actually replaces anything; fields it was never told about simply survive. A real `PATCH`, against the identical real route, doing the exact same real thing - correctly, this time - and in doing so proving the honest, real finding underneath both units: `update_machine` cannot actually tell `PUT` and `PATCH` apart at all. And a real `DELETE`, sent twice, returning two different real status codes over one identical real end state - the machine, gone, checked independently of either response.

**Next lesson:** This lesson treated status codes only as far as noticing that `200`, `201`, `404`, and a few others showed up; next, this curriculum studies the real, full meaning behind every status code this project's own backend actually returns, and what each one is supposed to promise a caller that the others don't.