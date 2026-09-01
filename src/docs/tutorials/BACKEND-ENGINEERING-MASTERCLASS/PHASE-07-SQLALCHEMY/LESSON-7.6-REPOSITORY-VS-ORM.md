# Lesson 7.6: Repository vs ORM

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Two real, run/grepped pieces of evidence from this project's own real backend, arguing opposite sides of the identical question: this project's own real `app/services/part_service.py` (`PartService`) - a real, fully-written repository-shaped layer, self-documented as replacing `Part.from_dict`/`Part.to_dict`, confirmed by a real, repo-wide search to be imported by zero real routes anywhere; and this project's own real `PDMService.checkout_file`, called directly and proven to genuinely orchestrate five real field mutations, a real lock-state check, and a real commit - work a bare model method would have to either duplicate or awkwardly own itself. The transferable problem: `model`, `query object`, `repository`, and `service` are four real, genuinely different architectural roles, and a real codebase adding all four for every single piece of data - whether or not the data actually needs that much structure - produces exactly the kind of unused, self-duplicating code this project's own real `PartService` already is.

**What you need to know first:** What a SQLAlchemy model class is; what a real Flask route handler does; what "business logic" means as a general term for real application-specific rules, as opposed to plain data storage or plain HTTP handling.

## Terms used in this lesson

- **query object** — A real, structured object representing a real, not-yet-executed database read, built by chaining real methods - this project's own real `Machine.query.filter(...)` already returns and re-uses one. It exists as its own, real architectural layer, distinct from the model itself, because a query's own shape (what to select, how to filter it) is a genuinely different concern than what a single real row's own data or behavior is.
- **repository** — A real, dedicated layer whose entire real job is translating between the database's own real representation of data and the application's own in-memory representation of it - fetching, constructing, and converting real objects, with no real business rules of its own. It exists, in principle, to let application code depend on a stable, real interface for "get me this data" without knowing anything about how it's actually stored - though this project's own real `PartService` shows what happens when this layer is added without anything in the application actually needing that abstraction yet: it existed, real and complete, and was never once called.
- **service** — A real, dedicated layer holding real, application-specific business logic and orchestration - coordinating more than one real step (validating state, mutating several real fields, calling out to a real external system) that doesn't belong entirely inside a single model's own method or a single route's own handler. It exists so that real, multi-step behavior has one, real, testable place to live - this project's own real `PDMService.checkout_file` is exactly this: a real lock-state check, five real field mutations, and a real commit, all in one real, callable place.

## Objects and methods used

- **`PartService (dead)`**
  - *What it is:* A real, existing, fully-written class in this project's own backend (`backend/app/services/part_service.py`), structured as a repository/service-shaped layer for the `Part` model.
  - *Implementation:* `class PartService: @staticmethod def get_part_by_id(part_id): return Part.query.get(part_id)`; `@staticmethod def create_part_instance(data: dict) -> Part:` - its own real docstring reads *"Replaces the old `Part.from_dict()` logic"*; `@staticmethod def serialize_part(part: Part) -> dict:` - its own real docstring reads *"This replaces the need for `Part.to_dict()`"* (`part_service.py:1-65`, read in full this session).
  - *Its use:* This lesson's own first unit greps this project's real, entire `backend/app` directory for any real import of this class or its own module - confirmed, this session, to return zero hits outside the file's own definition.
  - *Type:* A real class, every real method a `@staticmethod`.
  - *Responsibility:* By its own, real, stated design: centralizing every real `Part`-related data transformation in one place, replacing the identical logic living directly on the `Part` model.
  - *Depends on:* This project's own real `Part` model and live `db` extension - it needs nothing else to function; it is fully real, complete, working code.
  - *Connects to:* Nothing, in the real, running application - confirmed by this lesson's own first unit; `backend/app/routes/parts.py` calls `Part.from_dict`/`.to_dict()` directly instead, on every real route that needs them.
  - *Shape:* `get_part_by_id`/`create_part_instance` return a real `Part` instance; `serialize_part` returns a real `dict` - identical real shapes to what `Part.query.get`/`Part.from_dict`/`Part.to_dict` already, separately, provide.

- **`PDMService.checkout_file`**
  - *What it is:* A real, existing, actively-used static method on this project's own `PDMService` class (`backend/app/services/pdm_service.py`), orchestrating a real CAM-file check-out.
  - *Implementation:* `def checkout_file(cam_file_id, user_name, user_email, message):` (`pdm_service.py:35-58`) - looks up the real `CAMFile` row; if already `'checked_out'`, returns a real, structured error dict instead of mutating anything; otherwise sets five real fields (`checkout_status`, `checked_out_by`, `checked_out_by_email`, `checked_out_at`, `checkout_message`), commits, and returns the real, already-serialized row.
  - *Its use:* This lesson's own second unit calls this real method directly, confirming every one of its real, described mutations actually happened, by re-querying the real row afterward rather than trusting the return value alone.
  - *Type:* A real `@staticmethod` on the `PDMService` class.
  - *Responsibility:* Deciding, in one real place, whether a checkout is even valid right now, and, if so, performing every real field change and the real commit that checkout requires - all five mutations succeed together or (implicitly, via the transaction) none of them persist.
  - *Depends on:* A real, existing `CAMFile` row (looked up by real `cam_file_id`); real, live SQLAlchemy `db.session`.
  - *Connects to:* Called from `backend/app/routes/pdm.py`'s own real `checkout_cam_file` route, which passes the real request's own user/message fields straight through.
  - *Shape:* Takes four real strings in; returns a real `dict` - either `{'data': {...}}` on success or `{'error': ..., 'checkedOutBy': ..., 'status': 409}` if already checked out.

- **`Session (.add / .commit)`**
  - *What it is:* The real, live session object this project's own `db` extension exposes as `db.session`, and two of its real methods this lesson's own second lab uses to set up real rows before calling the real service method under test.
  - *Implementation:* `db.session.add(instance)` registers one real, new object as pending; `db.session.commit()` flushes every real pending change into real SQL and finalizes the real transaction.
  - *Its use:* This lesson's own second lab uses this identical real pair twice, to persist a real `Part` and a real `CAMFile` row before calling `PDMService.checkout_file` on the latter.
  - *Type:* A real instance of SQLAlchemy's `Session` class (`db.session`).
  - *Responsibility:* Staging a real, new object as pending, then, on `commit`, compiling and sending the real SQL that actually persists it.
  - *Depends on:* A real, open connection from this app's own real `Engine`.
  - *Connects to:* The real `CAMFile` row this lesson's own second unit then passes, by id, into `PDMService.checkout_file`.
  - *Shape:* `.add` takes a real object in, returns nothing; `.commit` takes nothing, returns nothing, but has the real, observable side effect of persisting every pending change.

## Concept Unit: A Real Repository Layer That Nobody Ever Calls

### The Problem

This project's own real `part_service.py` is a complete, real, working class - `PartService.create_part_instance` and `.serialize_part` do exactly what their own docstrings claim. Given that, does this project's own real `parts.py` route file actually use it?

Before reading on:

- `PartService`'s own real docstrings explicitly say it "replaces" `Part.from_dict`/`Part.to_dict`. If a real codebase genuinely adopted a replacement, what would you expect a real, repo-wide search for the old, replaced names to still show - zero real remaining call sites, or some?
- Before running the real search, what real, concrete evidence would actually settle whether `PartService` is used, rather than assuming from its own docstring's own claim?

### Project Change

- **Reference Source:** Real specimen: `backend/app/services/part_service.py:1-65` (`PartService`, in full) and `backend/app/routes/parts.py:53, 72,123,130,170,172` (every real `to_dict`/`from_dict` call site in that file), both read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - this unit's own evidence is a real, run search command, not new project code.
- **Dependencies:** This project's own real, existing `part_service.py` and `routes/parts.py` files.

### Mechanical Walkthrough

- `grep -rn "PartService|part_service" backend/app` — A real, repo-wide, case-sensitive search for either the real class name or the real module name, across every real file under `backend/app` - the one real, direct way to settle whether anything actually imports or calls it, rather than trusting a docstring's own claim.
- `grep -n 'from_dict|to_dict|PartService' backend/app/routes/parts.py` — The identical real search, narrowed to the one real file that would need to import `PartService` if it were actually in use - showing every real call this file makes instead, all directly on `Part` itself.

### CS Lens

This is **dead code**: real, complete, syntactically valid, and genuinely unreachable from anywhere the real application actually runs. Also recognized in: a real function still defined after every real call site was refactored to call something else instead, left behind rather than deleted; a real CSS class defined in a stylesheet that no real HTML element in the project still references; and, in this project's own domain, this project's own real `mastercam_xml_parser.py` - a second, real, complete XML parser, superseded by `final_parser.py`, referenced by nothing in the real, running application either.

### SE Lens

The design principle this real case study argues for is: add a real repository/service layer when the application actually needs the abstraction it provides - not by default, for every model, just because the pattern exists. The real alternative this project's own code actually settled on - `parts.py` calling `Part.from_dict`/`.to_dict()` directly - is simpler, with one fewer real layer to open when tracing a bug; the honest cost paid here wasn't from choosing that simpler alternative, it was from building the heavier one anyway and never finishing the switch: a real, complete, correctly-written class that every future reader of this codebase has to notice, read, and rule out as dead, over and over, for as long as it stays in the repository.

### Commands needed

- `grep -rn "PartService\|part_service" backend/app` — Run from the repository root; searches every real file under `backend/app` for either name, showing the real file and line of every real match.
- `grep -n "from_dict\|to_dict\|PartService" backend/app/routes/parts.py` — Run from the repository root; narrows the identical search to the one real file that would call `PartService` if anything did.

### Verification

```text
$ grep -rn "PartService\|part_service" backend/app
backend/app/services/part_service.py:4:class PartService:

$ grep -n "from_dict\|to_dict\|PartService" backend/app/routes/parts.py
53:        'data': [part.to_dict() for part in parts],
72:    part_data = part.to_dict()
73:    part_data['camFiles'] = [cf.to_dict(include_sequences=False) for cf in part.cam_files]
123:        part = Part.from_dict(data)
130:        return jsonify({'data': part.to_dict()}), 201
170:        socketio.emit('PART_UPDATED', part.to_dict())
172:        return jsonify({'data': part.to_dict()})
```

Full saved run: `N/A - real, run search commands; output captured directly above, not saved to a separate script/output pair.`.

### Connection to the previous unit

This lesson's own first unit; it establishes a real, concrete cost of adding a layer nobody ends up using - the next unit examines a real case where the identical kind of layer earns its place.

## Concept Unit: A Real Service Layer That Actually Earns Its Place

### The Problem

`PDMService.checkout_file` does five real things in one real call: checks a real lock state, sets five real fields, commits, and returns a real, structured result. If this exact same logic lived directly inside `Machine`... no - directly inside `CAMFile.to_dict()` or a bare route handler instead, what real problem would that actually cause?

Before reading on:

- `checkout_file`'s own real first real check (`if cam_file.checkout_status == 'checked_out':`) can return early, mutating nothing at all. If this logic lived as a `CAMFile` model method instead, what would that mean for how many real, different call sites would each need to remember to check the real return value for a real error before assuming the checkout actually happened?
- Given `checkout_file` needs a real `cam_file_id` string, a real `user_name`, a real `user_email`, and a real `message` - four real inputs a bare model method wouldn't naturally have access to on its own - what does that suggest about which real layer (model vs. service) is actually the right place for this real logic to live?

### Project Change

- **Reference Source:** Real specimen: `backend/app/services/pdm_service.py:35-58` (`PDMService.checkout_file`), read again this session.
- **Files affected:** `verification/phase-07/lab_service_layer_orchestration.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real `Part`/`CAMFile` models and real, already-shipped `PDMService`.

### The New Code

A real `CAMFile` row, checked out through the real, existing service method, with every real field mutation confirmed directly against a freshly re-queried row:

**File:** `verification/phase-07/lab_service_layer_orchestration.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.part import Part
from app.models.cam_file import CAMFile
from app.services.pdm_service import PDMService

app = create_app("testing")

with app.app_context():
    part = Part(id="P-SVC-001", part_number="8888888", description="Test Bracket")
    db.session.add(part)
    db.session.commit()

    cam = CAMFile(id="C-SVC-001", part_id="P-SVC-001", machine_id="M-NONE", file_name="bracket.mcam")
    db.session.add(cam)
    db.session.commit()

    print("before checkout_file():")
    print("  checkout_status:", repr(cam.checkout_status))
    print("  checked_out_by:", repr(cam.checked_out_by))

    result = PDMService.checkout_file(
        cam_file_id="C-SVC-001",
        user_name="programmer_joe",
        user_email="joe@example.com",
        message="checking out for edit",
    )

    print()
    print("after checkout_file(), real fields checked directly on the real, reloaded row:")
    reloaded = CAMFile.query.get("C-SVC-001")
    print("  checkout_status:", repr(reloaded.checkout_status))
    print("  checked_out_by:", repr(reloaded.checked_out_by))
    print("  checked_out_by_email:", repr(reloaded.checked_out_by_email))
    print("  checkout_message:", repr(reloaded.checkout_message))
    print("  checked_out_at is not None:", reloaded.checked_out_at is not None)
```

### Mechanical Walkthrough

- `part = Part(...); cam = CAMFile(...)` — Builds one real `Part` and one real `CAMFile` row - required first, since `checkout_file` needs a real, already-existing `CAMFile` row to look up by its own real `cam_file_id`.
- `result = PDMService.checkout_file(cam_file_id="C-SVC-001", ...)` — Calls the real, already-shipped service method directly, with the four real string arguments a bare `CAMFile` method wouldn't have on its own - the real user identity and message this checkout is actually being made under.
- `reloaded = CAMFile.query.get("C-SVC-001")` — Re-queries the real row fresh from the database, rather than trusting `cam` (the original, in-memory Python object) or `result` (the method's own returned dict) alone - real, independent confirmation the five real mutations actually persisted.
- `print(...) for each real field` — Confirms every one of `checkout_file`'s own five real, described mutations actually happened, on the real, reloaded row - not just that the method returned without error.

### CS Lens

This is a **transaction script**: one real, named operation, orchestrating several real, individually-simple steps (a check, a set of mutations, a commit) as a single, real, atomic-in-intent unit, rather than leaving each step's own ordering to whatever code happens to call them. Also recognized in: a real database migration script running several real `ALTER TABLE` statements as one named operation; a real CI/CD pipeline step bundling build-test-package into one real, named job; and, in this project's own domain, this project's own real `CAMImportService.handle_xml_import`, orchestrating real XML parsing, real tool-assembly syncing, and real row creation as one real, named operation, the identical shape as `checkout_file`'s own.

### SE Lens

The design principle is that real, multi-step business logic with real, non-trivial inputs (here, a real user identity and message, not just the row's own data) belongs somewhere callable by name, checked in one real place, rather than duplicated at every real call site or awkwardly bolted onto a model method that shouldn't need to know who's calling it. The real alternative not chosen - putting this real logic directly inside `backend/app/routes/pdm.py`'s own `checkout_cam_file` route handler - would work, for exactly one real caller; the honest cost already paid by the alternative this project's own code did *not* take here, contrasted with `PartService`'s own real cost from the previous unit: this layer, unlike that one, is real, used, and earns the one extra real hop a reader has to follow from the route to find out what checkout actually does.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-07/lab_service_layer_orchestration.py` — Runs this as a plain script, from the repository root; uses this app's own real `"testing"` config, so it leaves no real file behind.

### Verification

```text
Seeding default users...
before checkout_file():
  checkout_status: 'available'
  checked_out_by: None

after checkout_file(), real fields checked directly on the real, reloaded row:
  checkout_status: 'checked_out'
  checked_out_by: 'programmer_joe'
  checked_out_by_email: 'joe@example.com'
  checkout_message: 'checking out for edit'
  checked_out_at is not None: True
```

Full saved run: `verification/phase-07/lab_service_layer_orchestration_output.txt`.

### Connection to the previous unit

The previous unit proved a real, complete service layer can sit entirely unused; this unit proves the identical kind of layer, applied to real, multi-step, multi-input logic, is exactly what keeps that logic from being duplicated or misplaced.

## Connect the pieces

Two real classes, shaped the same real way - a static-method service layer sitting beside a model - with genuinely opposite real fates. `PartService`, real and complete, claims in its own docstrings to replace `Part.from_dict`/`Part.to_dict`; a real, repo-wide search confirms `parts.py` never adopted it, calling `Part.from_dict`/ `.to_dict()` directly instead, every time. `PDMService.checkout_file`, by contrast, is called for real by this lesson's own lab, and every one of its five real, described field mutations - `checkout_status`, `checked_out_by`, `checked_out_by_email`, `checkout_message`, and a real, non-`None` `checked_out_at` - is confirmed directly against a freshly reloaded row, not assumed from the method's own return value. The real difference between them was never the pattern itself; it was whether the application actually had real, multi-step, multi-input work that needed a real home.

**Next lesson:** This lesson examined a layer sitting between a route and a model. Next, this curriculum looks at what actually has to be true, at the database level, for a multi-step service method like `checkout_file` to be safe to call at all.