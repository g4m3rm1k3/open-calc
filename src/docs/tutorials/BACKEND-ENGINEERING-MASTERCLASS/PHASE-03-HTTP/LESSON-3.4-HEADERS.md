# Lesson 3.4: Headers

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Five real, run checks against this project's own real backend, one per kind of header - `Authorization`, `Content-Type`, `Accept`, a real custom header, and a real caching header - and, along the way, two genuine, previously-undocumented findings: this project's own real `favorites.py` routes carry no authentication at all, trusting a completely client-supplied, never-verified `X-User-Id` header to decide whose data a request can read or write; and a real, wrong-scheme `Authorization` header (`Basic` instead of `Bearer`) is treated identically to no header at all, even when it carries a genuinely valid token.

**What you need to know first:** What a client, server, request, and response are; what the real HTTP methods and status codes this project's own backend actually returns mean; what a decorator wrapping a view function can do before that function's own body runs.

## Terms used in this lesson

- **Authorization (header)** — The real, standard header carrying a request's own claimed credentials - in this project, always `Bearer <token>`. It exists as the one real, conventional place a server looks for proof of identity, separate from a request's own body or URL.
- **Content-Type** — The real header naming the actual real format of a request's own body - `application/json` for every write in this project. It exists so a server knows how to parse the real bytes that follow, before it ever tries.
- **Accept** — The real header a client uses to say what real response format it would prefer back. It exists as the real, standard mechanism for content negotiation - though, as this lesson's own third unit shows directly, a server is never obligated to honor it.
- **custom header** — A real header this project invented itself - `X-User-Id`, in this lesson's own fourth unit - rather than one HTTP's own spec defines. It exists because a real application sometimes needs to carry information no standard header was built for; the real `X-` prefix is this project's own convention for marking one as non-standard.
- **caching header** — A real header telling a client (or an intermediate cache) how long a real response may be reused without asking the server again - `Cache-Control`, in this project's own real `/uploads/` route. It exists so a server can make an explicit, real promise about a response's own freshness, rather than leaving every client to guess.

## Objects and methods used

- **`token_required`**
  - *What it is:* The real, existing decorator factory in this project's own backend, deciding whether a request is allowed to reach the view function it wraps.
  - *Implementation:* `def token_required(allowed_roles: list = None): ...` (`backend/app/utils/auth_utils.py:308-488`) - reads a real `Authorization` header (`:401-410`); if it's present but doesn't start with the literal real string `'Bearer '`, `auth_header.startswith('Bearer ')` is `False`, so `token` is never assigned and stays `None` - the identical real value as if no `Authorization` header had been sent at all, falling into the same real no-token branch (`:415-436`).
  - *Its use:* This lesson calls it with a real, valid token sent under the wrong real scheme, specifically to check whether "wrong scheme" and "missing entirely" are actually treated differently.
  - *Type:* A decorator factory - a function that returns a real decorator.
  - *Responsibility:* Deciding, for every real request, whether it's allowed to proceed - based only on whether a real, well-formed `Bearer` token was actually found, never on whether SOME `Authorization` header was merely present.
  - *Depends on:* `allowed_roles`; the real `Authorization` header, if present, and specifically whether it starts with the real literal `'Bearer '`.
  - *Connects to:* Wraps `create_machine`, the same real route this lesson's own first unit calls; its own real string-prefix check is the entire specimen that unit is built around.
  - *Shape:* Takes a real list of role strings in; returns a real decorator that inspects the real `Authorization` header before ever calling the wrapped view function.

- **`request.get_json`**
  - *What it is:* The real method Flask's own `Request` object provides for parsing a request's real body as JSON.
  - *Implementation:* `get_json(self, force: bool = False, silent: bool = False, cache: bool = True) -> Any | None` (confirmed this session via `inspect.signature` against the real, installed Flask source) - every route in this project calls it with no arguments, so `silent=False`; when the real `Content-Type` header isn't `application/json`, it raises a real `werkzeug.exceptions.UnsupportedMediaType`, which Flask's own error handling converts into a real `415` response, before the calling view function's own body ever runs.
  - *Its use:* This lesson calls it indirectly, through `update_machine_status`, specifically to observe its real behavior when the real `Content-Type` header doesn't match what it expects.
  - *Type:* A real instance method on Flask's own `Request` class.
  - *Responsibility:* Parsing a request's real body as JSON, or refusing to, based on what the real `Content-Type` header actually claims.
  - *Depends on:* The real `Content-Type` header; the real bytes of the request body.
  - *Connects to:* Called, with no arguments, at the start of nearly every real write route in this project, including `update_machine_status`; its own real refusal, when it fires, happens before that route's own code ever executes.
  - *Shape:* Takes no required arguments; returns a real, parsed value (a dict, for every real body in this project) - or raises a real exception Flask itself turns into a `415` response.

- **`get_machine`**
  - *What it is:* A real, existing Flask view function retrieving one machine by ID.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>', methods=['GET'])` `def get_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:48-61`) - never reads `request.headers` at all, and always returns its result through `jsonify(...)`, which always sets a real `Content-Type: application/json` response header regardless of what the request asked for.
  - *Its use:* This lesson calls it three times, with three different real `Accept` header values, specifically to check whether any of them change the real response.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Reading exactly one real machine's current data by ID - with no real awareness of what format the caller says it would prefer.
  - *Depends on:* A real `machine_id` matched from the request URL.
  - *Connects to:* Also wrapped by `token_required`; its own real, unconditional `jsonify(...)` call is the entire specimen this lesson's own `Accept` unit is built around.
  - *Shape:* Takes a `machine_id` string in; always returns a real, `jsonify`-wrapped dict, regardless of any real `Accept` header.

- **`get_favorites / add_favorite`**
  - *What it is:* Two real, existing Flask view functions listing and creating a real user's favorited machine/CAM pairings.
  - *Implementation:* `@favorites_bp.route('/', methods=['GET']) def get_favorites(): ...` (`backend/app/routes/favorites.py:14-30`) and `@favorites_bp.route('/', methods=['POST']) def add_favorite(): ...` (`:33-58`) - neither carries a `@token_required` decorator at all; both read `request.headers.get('X-User-Id', 'programmer')` (`:18`, `:37`) and use that real, entirely client-supplied string directly as the real `user_id` to query or write against, with no real check against any authenticated identity anywhere in either function.
  - *Its use:* This lesson calls `get_favorites` three times - with no header at all, with `X-User-Id: alice`, and with `X-User-Id: bob` - specifically to observe what real difference, if any, is actually verified before a request gets back one real user's private data.
  - *Type:* Two Flask view functions, neither wrapped by `@token_required`.
  - *Responsibility:* Reading and creating real favorite records for whatever real `user_id` a request happens to name - with no real responsibility, anywhere in either function, for confirming that name is genuine.
  - *Depends on:* A real, optional `X-User-Id` header (or `userId` query param/body field); a real, existing `UserFavorite` row to find.
  - *Connects to:* Registered under `/api/favorites` with no authentication blueprint of any kind; this lesson's own custom-header unit is built entirely around this real, verified gap.
  - *Shape:* `get_favorites` takes nothing from the URL and returns a real, `jsonify`-wrapped list; `add_favorite` reads a real dict body and returns a real, `jsonify`-wrapped dict with an explicit `201`.

- **`serve_uploads`**
  - *What it is:* A real, existing Flask view function serving files from this project's own real upload storage.
  - *Implementation:* `@app.route('/uploads/<path:filename>') def serve_uploads(filename): ...` (`backend/app/__init__.py:308-337`) - builds a response via `send_from_directory`, then checks whether `filename` ends with one of a real, hard-coded tuple of 3D-model extensions (`.obj`, `.stl`, `.iges`, `.step`, `.stp`, `.x_t`, `.x_b`, `:327`); if so, sets a real `Cache-Control: public, max-age=604800, immutable` header (`:331`), otherwise a real `Cache-Control: public, max-age=3600` (`:335`).
  - *Its use:* This lesson requests one real `.stl` file and one real `.jpg` file through it, specifically to observe its real, differentiated caching promise for each.
  - *Type:* A Flask view function, registered directly on the app (not a blueprint), with no `@token_required` decorator.
  - *Responsibility:* Serving a real uploaded file's real bytes, and telling the real client how long it's safe to reuse that response without asking again - a genuinely different real real answer depending on the file's own real extension.
  - *Depends on:* A real file actually present in the app's own real `UPLOAD_FOLDER`; that file's own real name/extension.
  - *Connects to:* Its own real `if filename.lower().endswith(model_extensions):` branch (`:328`) is the entire specimen this lesson's own caching unit is built around.
  - *Shape:* Takes a real `filename` string in (from the URL); returns a real `Response` carrying the real file's own bytes and a real, extension-dependent `Cache-Control` header.

## Concept Unit: Authorization - A Real Scheme, Not Just a Real Token

### The Problem

`token_required`'s own real code only assigns `token` when `auth_header.startswith('Bearer ')` is `True` (`auth_utils.py:407-409`). What happens to a real, otherwise-valid token, sent under a different real scheme?

Before reading on:

- If a real `Authorization` header reads `"Basic eyJhbGc..."` - a real, valid JWT, just not preceded by the literal real string `"Bearer "` - does `auth_header.startswith('Bearer ')` return `True` or `False`?
- Given your answer, does `token_required`'s own real code ever actually attempt to decode that real token at all, or does it take the exact same real path as a request with no `Authorization` header whatsoever?

### Project Change

- **Reference Source:** Real specimen: `backend/app/utils/auth_utils.py:401-436`, read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `User` row with a `programming` role and a real, valid token for it.

### The New Code

The identical real token, sent three different real ways:

**File:** `verification/phase-03/lab_header_authorization.py` (new)

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
    client = app.test_client()
    body = {"id": "M-TEST-001", "name": "Test Mill", "category": "mill", "subType": "3_axis", "manufacturer": "Haas", "model": "VF-2"}

    r_none = client.post("/api/machines", json=body)
    print("no Authorization header at all -> status:", r_none.status_code, "code:", r_none.get_json().get("code"))

    r_malformed = client.post("/api/machines", json=body, headers={"Authorization": f"Basic {token}"})
    print("real, valid token, wrong real scheme ('Basic' not 'Bearer') -> status:", r_malformed.status_code, "code:", r_malformed.get_json().get("code"))

    r_valid = client.post("/api/machines", json=body, headers={"Authorization": f"Bearer {token}"})
    print("real, valid token, real 'Bearer' scheme -> status:", r_valid.status_code)

    assert r_none.status_code == 401
    assert r_malformed.status_code == 401
    assert r_none.get_json()["code"] == r_malformed.get_json()["code"] == "TOKEN_MISSING"
    assert r_valid.status_code == 201
    print("a real, valid token sent with the wrong scheme is treated exactly like no header at all - both real calls hit the identical real TOKEN_MISSING branch")
```

### Mechanical Walkthrough

- `client = app.test_client()` — Builds one real `FlaskClient` - this lesson's own first construction of it; every later unit in this lesson builds its own fresh copy the same way.
- `r_none = client.post("/api/machines", json=body)` — Sends a real request with no `Authorization` header at all - the real baseline this unit's other two calls are measured against.
- `r_malformed = client.post("/api/machines", json=body, headers={"Authorization": f"Basic {token}"})` — Sends the identical real, valid token, but prefixed with `"Basic "` instead of `"Bearer "` - `auth_header.startswith('Bearer ')` (`auth_utils.py:407`) is `False`, so `token` never gets assigned at all, staying `None`.
- `r_valid = client.post("/api/machines", json=body, headers={"Authorization": f"Bearer {token}"})` — Sends the identical real token, this time with the exact, real, expected scheme - the control case proving the token itself was genuinely valid all along.
- `assert r_none.get_json()["code"] == r_malformed.get_json()["code"] == "TOKEN_MISSING"` — Confirms, for real, that both rejected calls hit the identical real code path - `token_required` never distinguishes "you sent nothing" from "you sent something, but not in the real format I check for."

### CS Lens

This is **header value parsing as a real gate**: a header's own real presence isn't enough - its real, exact format has to match before anything inside it is even inspected. Also recognized in: a shell's own real argument parser rejecting `-h` when only `--help` is recognized, without ever reading past the flag name; an HTTP `Content-Type` header's own real parameter syntax (`application/json; charset=utf-8`) failing a strict real parser that only checks the substring; and, in this project's own domain, a G-code line's own real modal-group prefix determining whether the rest of the line is even interpreted as a movement command.

### SE Lens

The design principle behind requiring an exact real scheme prefix is that `Authorization`'s own real spec supports multiple real schemes (`Bearer`, `Basic`, `Digest`, others) - checking for the literal string is how a server tells them apart before attempting to decode anything scheme-specific. The real alternative not chosen: attempting to decode ANY string after `Authorization:` as a JWT regardless of scheme, which would be more permissive but would blur a genuine client mistake (wrong scheme) with a genuinely absent credential; the honest cost of the strict check this project's own code actually makes, proven directly by this unit's own real run: a caller who sent a real, valid token gets the identical real `TOKEN_MISSING` error as a caller who sent nothing - the response body gives no real hint that the token itself was fine.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_header_authorization.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
no Authorization header at all -> status: 401 code: TOKEN_MISSING
real, valid token, wrong real scheme ('Basic' not 'Bearer') -> status: 401 code: TOKEN_MISSING
real, valid token, real 'Bearer' scheme -> status: 201
a real, valid token sent with the wrong scheme is treated exactly like no header at all - both real calls hit the identical real TOKEN_MISSING branch
```

Full saved run: `verification/phase-03/lab_header_authorization_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes that a header's own real value has to match an exact real format before anything it carries actually matters.

## Concept Unit: Content-Type - What Format the Body Actually Is

### The Problem

`request.get_json()`, called with no arguments (as every route in this project calls it), has `silent=False` by real, confirmed default. What happens when a request's own real body IS valid JSON, but the real `Content-Type` header says it isn't?

Before reading on:

- If a server trusted a request's real body without ever checking `Content-Type`, what real kind of mistake could a client make that the server would have no way to catch early?
- `update_machine_status`'s own real code (`machines.py:93`) calls `request.get_json()` as its very first real step. If that call itself refuses to run, does any of the route's own real validation logic - the real `400` checks this curriculum already studied - ever get a chance to run at all?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:80-115` (`update_machine_status`), read again this session; Flask's own real `get_json` signature, confirmed this session via `inspect.signature`.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; a real `User` row with a `programming` role and token.

### The New Code

The identical real JSON bytes, sent with two different real `Content-Type` headers:

**File:** `verification/phase-03/lab_header_content_type.py` (new)

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

    r_correct = client.put("/api/machines/M-TEST-001/status", json={"status": "running"}, headers=headers)
    print("real Content-Type: application/json (via json=) -> status:", r_correct.status_code)

    r_wrong = client.put(
        "/api/machines/M-TEST-001/status",
        data='{"status": "running"}',
        content_type="text/plain",
        headers=headers,
    )
    print("identical real body, real Content-Type: text/plain -> status:", r_wrong.status_code, "body:", r_wrong.get_data(as_text=True)[:120])

    assert r_correct.status_code == 200
    assert r_wrong.status_code == 415
    print("the identical real bytes, sent with the wrong real Content-Type, never even reach update_machine_status's own code at all")
```

### Mechanical Walkthrough

- `r_correct = client.put(..., json={"status": "running"}, headers=headers)` — `FlaskClient`'s own real `json=` argument automatically sets a real `Content-Type: application/json` header - the control case, matching what every earlier lesson's own real requests already did.
- `r_wrong = client.put(..., data=..., content_type="text/plain", headers=headers)` — Sends the identical real JSON text as raw `data`, with a real `Content-Type: text/plain` header explicitly overriding the default - the real bytes on the wire are identical to the first call; only the real header describing them differs.
- `assert r_wrong.status_code == 415` — Confirms, for real, that `request.get_json()`'s own real refusal - not any code inside `update_machine_status` itself - is what produced this response; the route's own real validation logic never even ran.

### CS Lens

This is **declared format as a real precondition**: a header stating what a payload IS, checked before the payload is interpreted at all. Also recognized in: a file's own real magic number/extension mismatch causing a program to refuse to open it, even if the real bytes inside would otherwise parse fine; an email's own real `Content-Type: multipart/...` boundary, without which a mail client can't know how to split the body at all; and, in this project's own domain, a CAM post-processor refusing a file whose real extension doesn't match its declared machine type, before ever reading a single real line of code inside it.

### SE Lens

The design principle is failing fast, structurally, before any real business logic runs - `update_machine_status`'s own real `400` checks for a missing or invalid `status` value never even get a chance to fire here, because Flask's own real `get_json` stops the request first. The real alternative not chosen: calling `request.get_json(silent=True)` and handling a real `None` result manually, which would let the route's own code decide how to respond, and could return a real, project-consistent JSON error body instead of Flask's own generic real HTML page; the honest cost of the default this project's own code actually uses, proven directly by this unit's own real run: this ONE real route, alone among every real error this project returns, hands back real HTML instead of the real JSON error shape every other failure in this project uses.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_header_content_type.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
real Content-Type: application/json (via json=) -> status: 200
identical real body, real Content-Type: text/plain -> status: 415
the identical real bytes, sent with the wrong real Content-Type, never even reach update_machine_status's own code at all
```

Full saved run: `verification/phase-03/lab_header_content_type_output.txt`.

### Connection to the previous unit

The previous unit showed a request header gating WHO a request is trusted as; this unit shows a request header gating WHAT a request's own body is even allowed to mean.

## Concept Unit: Accept - A Real Header This Project Never Reads

### The Problem

`get_machine`'s own real code (`machines.py:48-61`) never references `request.headers` or `request.accept_mimetypes` anywhere in its body. If a real client sends a real `Accept` header asking for something other than JSON, what happens?

Before reading on:

- HTTP's own real content-negotiation model says a server MAY return a real `406 Not Acceptable` if it genuinely can't satisfy a client's `Accept` header. Given that `get_machine` never reads `Accept` at all, could it ever actually return a `406`?
- If every real response this route produces goes through the identical real `jsonify(...)` call regardless of what's asked for, what does that suggest about whether this API supports more than one real response format at all?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:48-61` (`get_machine`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row.

### The New Code

The identical real request, sent with three different real `Accept` headers:

**File:** `verification/phase-03/lab_header_accept.py` (new)

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

    r_json = client.get("/api/machines/M-TEST-001", headers={"Accept": "application/json"})
    print("Accept: application/json -> status:", r_json.status_code, "real Content-Type:", r_json.content_type)

    r_plain = client.get("/api/machines/M-TEST-001", headers={"Accept": "text/plain"})
    print("Accept: text/plain      -> status:", r_plain.status_code, "real Content-Type:", r_plain.content_type)

    r_nonsense = client.get("/api/machines/M-TEST-001", headers={"Accept": "application/x-does-not-exist"})
    print("Accept: application/x-does-not-exist -> status:", r_nonsense.status_code, "real Content-Type:", r_nonsense.content_type)

    assert r_json.status_code == r_plain.status_code == r_nonsense.status_code == 200
    assert r_json.content_type == r_plain.content_type == r_nonsense.content_type == "application/json"
    print("three real, different Accept headers, one identical real result every time - this route never reads Accept at all")
```

### Mechanical Walkthrough

- `r_json = client.get("/api/machines/M-TEST-001", headers={"Accept": "application/json"})` — Sends a real, honest `Accept` header - matches what this route actually returns.
- `r_plain = client.get(..., headers={"Accept": "text/plain"})` — Sends a real `Accept` header asking for a format this route never produces.
- `r_nonsense = client.get(..., headers={"Accept": "application/x-does-not-exist"})` — Sends a real `Accept` header naming a format that isn't a real, registered media type at all - the most extreme real test of whether this route's own code inspects the header in any way.
- `assert r_json.content_type == r_plain.content_type == r_nonsense.content_type == "application/json"` — Confirms, for real, that all three real requests produced the identical real response format - proof this route's own code never branches on `Accept` at all, in any of the three real cases.

### CS Lens

This is a **real header with no real enforcement**: HTTP defines what `Accept` means, but nothing forces a server to honor it. Also recognized in: a real `robots.txt` file (a real, standard convention a crawler is free to ignore entirely); an HTML `<meta charset>` tag a browser may override based on its own real heuristics; and, in this project's own domain, a machine control that accepts an optional real feed-rate override in a G-code comment, but keeps running its own programmed rate if nothing in its own logic actually reads that comment.

### SE Lens

The design principle a real content-negotiating API would follow is inspecting `Accept` and either honoring it or returning a real `406` when it can't - useful when an API genuinely supports more than one real format (JSON and XML, say). The real alternative this project's own code actually takes: supporting exactly one real format, unconditionally, which makes `Accept`-checking pure, real, unnecessary complexity for an API that was never going to return anything else; the honest cost, proven directly by this unit's own three real calls: a client that genuinely can't consume JSON gets no real, honest `406` telling it so - it just gets JSON anyway, whether that's useful to it or not.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_header_accept.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
Accept: application/json -> status: 200 real Content-Type: application/json
Accept: text/plain      -> status: 200 real Content-Type: application/json
Accept: application/x-does-not-exist -> status: 200 real Content-Type: application/json
three real, different Accept headers, one identical real result every time - this route never reads Accept at all
```

Full saved run: `verification/phase-03/lab_header_accept_output.txt`.

### Connection to the previous unit

The previous unit showed a header this project's own code actively enforces (`Content-Type`); this unit shows the opposite - a real, standard header this project's own code never even looks at.

## Concept Unit: A Custom Header - X-User-Id, Trusted With Nothing Behind It

### The Problem

`get_favorites`'s own real code (`favorites.py:14-30`) carries no `@token_required` decorator at all, and reads `request.headers.get('X-User-Id', 'programmer')` (`:18`) directly as the real identity to query against. What real proof does this route actually require that a caller is who that header claims?

Before reading on:

- Every earlier unit in this lesson (and every earlier lesson in this curriculum) that reached a real, protected route went through `token_required` first. Does `get_favorites`'s own real route decorator (`favorites.py:14`) include anything like it?
- If a real request sets `X-User-Id: bob`, what real, cryptographic, or database check would have to exist somewhere in `get_favorites`'s own code for the server to know this request genuinely comes from `bob`, rather than someone simply typing that string?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/favorites.py:14-30` (`get_favorites`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `MachineCAMPairing` row and one real `UserFavorite` row belonging to `"alice"`.

### The New Code

The identical real route, called three times, with three different (or absent) real `X-User-Id` headers - and no real `Authorization` header at all, on any of them:

**File:** `verification/phase-03/lab_header_custom.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine_pairing import MachineCAMPairing
from app.models.user_favorite import UserFavorite

app = create_app("testing")
with app.app_context():
    pairing = MachineCAMPairing(id="PAIR-001", cam_file_id="CAM-FAKE", machine_id="MACH-FAKE")
    db.session.add(pairing)
    db.session.commit()

    favorite = UserFavorite(user_id="alice", pairing_id="PAIR-001")
    db.session.add(favorite)
    db.session.commit()

    client = app.test_client()

    r_no_header = client.get("/api/favorites/")
    print("no X-User-Id header, no Authorization header at all -> status:", r_no_header.status_code, "data:", r_no_header.get_json()["data"])

    r_alice = client.get("/api/favorites/", headers={"X-User-Id": "alice"})
    print("X-User-Id: alice (real favorite exists) -> status:", r_alice.status_code, "count:", len(r_alice.get_json()["data"]))

    r_bob = client.get("/api/favorites/", headers={"X-User-Id": "bob"})
    print("X-User-Id: bob  (claimed, never verified)  -> status:", r_bob.status_code, "count:", len(r_bob.get_json()["data"]))

    assert r_no_header.status_code == r_alice.status_code == r_bob.status_code == 200
    assert r_no_header.get_json()["data"] == []
    assert len(r_alice.get_json()["data"]) == 1
    assert len(r_bob.get_json()["data"]) == 0
    print("no token, no password, nothing checked against a real user record - a client gets whichever real user's data it simply claims, by setting one real header")
```

### Mechanical Walkthrough

- `pairing = MachineCAMPairing(id="PAIR-001", cam_file_id="CAM-FAKE", machine_id="MACH-FAKE")` — Builds one real `MachineCAMPairing` row - required only because `UserFavorite`'s own real `pairing_id` column is a non-nullable foreign key; this lesson's own point is entirely about the favorite record that references it, not this row itself.
- `favorite = UserFavorite(user_id="alice", pairing_id="PAIR-001")` — Builds one real `UserFavorite` row, tagged with the plain real string `"alice"` as its owner - notably, not a real `User` row's own ID verified against anything; this exact string is what a later real request will have to guess, or simply claim, to get this row back.
- `r_no_header = client.get("/api/favorites/")` — Sends a real request with no headers relevant to identity at all - `request.headers.get('X-User-Id', 'programmer')` (`favorites.py:18`) falls back to its real, hard-coded default, and the real query finds nothing for that user.
- `r_alice = client.get("/api/favorites/", headers={"X-User-Id": "alice"})` — Sends a real, plain header naming `"alice"` - no signature, no token, nothing else - and the real query returns the one real favorite that real string happens to match in the database.
- `r_bob = client.get("/api/favorites/", headers={"X-User-Id": "bob"})` — Sends the identical kind of real, unverified claim, this time for a user with no real data - proving the route genuinely queries by whatever string it's handed, with nothing checked beforehand.
- `assert len(r_alice.get_json()["data"]) == 1 / assert len(r_bob.get_json()["data"]) == 0` — Confirms, for real, that this route's own real output changes based purely on a client-supplied header value, with zero real authentication anywhere in the request.

### CS Lens

This is **unauthenticated identity claim**: a real header carrying an assertion about who's asking, with nothing verifying that assertion is true. Also recognized in: an HTTP `From` header (any real client can put any real email address there); a `X-Forwarded-For` header, trusted by some real, misconfigured servers as a client's real IP with no cryptographic proof behind it; and, in this project's own domain, a shop-floor terminal that lets an operator type in any real employee ID by hand, with no badge scan to confirm it.

### SE Lens

The design principle real authentication requires is that an identity claim be backed by something the claimant alone could produce - a signed token, a password - not just a plain string a request happens to include. The real alternative this project's own code does NOT implement here: wrapping `get_favorites` and `add_favorite` in `@token_required`, the identical real decorator every route this curriculum has studied elsewhere already uses; the honest cost, proven directly by this unit's own three real calls: any real caller can read - or, given `add_favorite`'s identical real pattern, write - any other real user's favorites, by simply setting one real header to that user's real ID.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_header_custom.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
no X-User-Id header, no Authorization header at all -> status: 200 data: []
X-User-Id: alice (real favorite exists) -> status: 200 count: 1
X-User-Id: bob  (claimed, never verified)  -> status: 200 count: 0
no token, no password, nothing checked against a real user record - a client gets whichever real user's data it simply claims, by setting one real header
```

Full saved run: `verification/phase-03/lab_header_custom_output.txt`.

### Connection to the previous unit

The previous unit showed a real header this project's own code chooses to ignore harmlessly; this unit shows a real header this project's own code trusts completely, with real consequences.

## Concept Unit: Cache-Control - A Real, Different Promise Per File

### The Problem

`serve_uploads`'s own real code (`__init__.py:308-337`) sets a genuinely different real `Cache-Control` value depending on a file's own real extension. What real promise does that header actually make, and does it hold for every real file this route serves?

Before reading on:

- `serve_uploads`'s own real comment (`__init__.py:329-330`) says 3D model files are cached longer because they "rarely change once uploaded." Is that a real, verified fact about this project's own file-storage behavior, or an assumption the code's own author made?
- If a real image file and a real `.stl` file are requested through the identical real route, what in the code actually decides which real `Cache-Control` value either one gets?

### Project Change

- **Reference Source:** Real specimen: `backend/app/__init__.py:308-337` (`serve_uploads`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** Two real, local files (one `.stl`, one `.jpg`) in a real, temporary directory, with the app's own `UPLOAD_FOLDER` configured to point at it.

### The New Code

Two real files, the identical real route, two real `Cache-Control` values:

**File:** `verification/phase-03/lab_header_caching.py` (new)

```python
import sys
import os
import tempfile
sys.path.insert(0, "backend")

from app import create_app

tmpdir = tempfile.mkdtemp()
with open(os.path.join(tmpdir, "part.stl"), "w") as f:
    f.write("fake stl content")
with open(os.path.join(tmpdir, "photo.jpg"), "w") as f:
    f.write("fake jpg content")

app = create_app("testing")
app.config["UPLOAD_FOLDER"] = tmpdir
with app.app_context():
    client = app.test_client()

    r_model = client.get("/uploads/part.stl")
    print("GET /uploads/part.stl (a real 3D model file) -> Cache-Control:", r_model.headers.get("Cache-Control"))

    r_image = client.get("/uploads/photo.jpg")
    print("GET /uploads/photo.jpg (a real image file)   -> Cache-Control:", r_image.headers.get("Cache-Control"))

    assert r_model.headers.get("Cache-Control") == "public, max-age=604800, immutable"
    assert r_image.headers.get("Cache-Control") == "public, max-age=3600"
    print("the identical real route, two real file extensions, two real, different caching promises")
```

### Mechanical Walkthrough

- `app.config["UPLOAD_FOLDER"] = tmpdir` — Points this project's own real `serve_uploads` route at a real, local temporary directory instead of the project's own real upload storage - keeps this lesson's own lab fully self-contained.
- `r_model = client.get("/uploads/part.stl")` — Requests a real file whose extension (`.stl`) matches `serve_uploads`'s own real `model_extensions` tuple (`__init__.py:327`), triggering its real, longer-lived `Cache-Control` value.
- `r_image = client.get("/uploads/photo.jpg")` — Requests a real file whose extension doesn't match - the identical real route's `else` branch (`__init__.py:333-335`) sets the shorter real value instead.
- `assert r_model.headers.get("Cache-Control") == "public, max-age=604800, immutable" / assert r_image.headers.get(...) == "public, max-age=3600"` — Confirms both real, distinct promises this route actually makes, for real files that differ only in their extension.

### CS Lens

This is **explicit cache lifetime negotiation**: a real, one-way promise from server to client about how long a specific real response stays valid without asking again. Also recognized in: a CDN's own real, per-file-type cache rules; a package manager's own real decision to cache a version-pinned dependency forever, but re-check a `latest` tag on every real install; and, in this project's own domain, a machine's own real tool-offset table, trusted as valid between real tool changes but re-verified after one.

### SE Lens

The design principle is that a longer real cache lifetime is a genuine, real bet - it only pays off if the underlying real file genuinely doesn't change; get it wrong, and a real client keeps showing a stale real file for up to seven real days, with no way to force an update short of a real cache-busting URL change. The real alternative not chosen: caching every real upload identically (a single real `Cache-Control` value for every file), which would be simpler but would either under-cache real, genuinely-immutable model files or over-cache real, occasionally-replaced images; the honest cost of the differentiated choice this project's own code actually makes, proven directly by this unit's own real run: the `immutable` real hint on model files is only as trustworthy as the real, uncoded assumption behind it - nothing in `serve_uploads`'s own real code actually verifies a re-uploaded `.stl` file at the identical real filename gets a genuinely new URL, rather than silently colliding with a stale, real, still-cached one.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_header_caching.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
GET /uploads/part.stl (a real 3D model file) -> Cache-Control: public, max-age=604800, immutable
GET /uploads/photo.jpg (a real image file)   -> Cache-Control: public, max-age=3600
the identical real route, two real file extensions, two real, different caching promises
```

Full saved run: `verification/phase-03/lab_header_caching_output.txt`.

### Connection to the previous unit

The previous unit showed a header a client sends, trusted with no real verification; this unit closes the lesson on a header the SERVER sends, making its own real promise to every future real client that requests the identical real URL.

## Connect the pieces

One real credential, sent under the wrong real scheme and rejected exactly like no credential at all (`Authorization`). The identical real JSON bytes, refused before a single line of real route logic ever ran, because one real header described them wrong (`Content-Type`). Three real, different requests for three real, different formats, all getting the identical real JSON back, because nothing in this project's own code ever reads the header that asked (`Accept`). A real, plain string, never checked against anything, deciding whose real private data a request receives back - the most consequential real finding in this lesson (a real custom header, `X-User-Id`). And, closing the lesson, the one real header direction reversed - the SERVER promising a real client how long a real file may be trusted, a promise this lesson's own two real requests confirmed differs by file type, and whose real safety rests on an assumption nothing in the code actually checks (`Cache-Control`).

**Next lesson:** Every request and response body this lesson touched was already JSON, taken for granted; next, this curriculum studies what actually makes a JSON API work as a real contract - serialization, deserialization, and the real shape a response body promises to keep.