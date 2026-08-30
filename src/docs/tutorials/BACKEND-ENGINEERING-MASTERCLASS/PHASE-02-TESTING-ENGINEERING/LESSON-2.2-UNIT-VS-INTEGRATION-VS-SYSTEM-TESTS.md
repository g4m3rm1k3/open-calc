# Lesson 2.2: Unit vs Integration vs System Tests

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Three real, throwaway checks - one against a single pure function with nothing else involved, one that persists a real row into a real (if in-memory) database, and one that sends real HTTP requests through this project's real Flask app - plus a fourth check that actually times all three, for real, to turn "unit tests are faster" from a claim into a measured fact about this project's own code.

**What you need to know first:** What a test actually checks and why an `assert` statement is the smallest way to check it; reading a raised exception's traceback; defining and calling plain Python functions; at an orientation level, the basic shape of a client sending a request and a server sending back a response.

## Terms used in this lesson

- **unit test** — A check that exercises exactly one piece of code - typically one function or method - in complete isolation from everything it doesn't itself define: no real database, no real network call, no other real service standing in the way. It exists to answer the narrowest possible question - does this one piece of logic do what it claims - as fast and as unambiguously as possible.
- **integration test** — A check that exercises real code together with at least one real collaborator it actually depends on - most often a real database - to confirm the two genuinely work together, not just that each one works alone. It exists because a unit test can prove a function's own logic is right while saying nothing at all about whether that function correctly reads or writes whatever real system it was built to talk to.
- **system test** — A check that exercises the whole application through the same real interface an actual caller would use - an HTTP request, for this project - touching routing, application setup, and every layer in between, not just one function or one database call. It exists to catch problems that only exist at the seams between pieces - a route wired to an unexpected URL, for instance - that no smaller-scoped check would ever see.
- **collaborator (test scope)** — Anything a piece of code depends on but does not itself define - a database, a file on disk, another service, the current time. It exists as a precise way to talk about test scope: whether a check counts as unit, integration, or system is entirely a question of how many real collaborators it lets in, not how much code happens to run while it executes.
- **application context** — Flask's own `with app.app_context(): ...` block, which makes one specific app instance "current" for the code running inside it, so app-bound resources like a database connection can be looked up without being passed around explicitly. It exists because a single Python process can build more than one Flask app (this project's own `create_app` is called fresh in every lab in this lesson), so any code that needs "the current app's" resources needs an explicit, temporary way to say which app that actually is.
- **in-memory database** — A real, fully-functioning SQLite database that exists only in memory (`sqlite:///:memory:`) for the lifetime of one Python process, instead of being written to a file on disk. It exists so an integration test can use a genuinely real database - real tables, real SQL, real constraints - without ever touching a real, permanent data file, and with nothing left over to clean up afterward.
- **static method** — A method declared with Python's `@staticmethod` decorator, callable directly on the class itself (`ClassName.method(...)`) without ever constructing an instance, and receiving no automatic `self` argument. It exists for a method whose logic genuinely doesn't need any per-instance state - it's grouped inside the class only because it's conceptually related to it, not because it needs anything a real instance of that class carries.
- **HTTP GET request** — A request asking a server to return a resource, carrying no request body of its own - the "read," not "write," half of the request/response exchange this project's backend serves over the network. It exists as one specific, named request method (among several this lesson does not cover) because a client has to state which kind of operation it's asking for, not only which URL.
- **HTTP status code** — A real three-digit number every HTTP response carries, stating in one compact, standardized value whether the request succeeded and, if not, roughly why - `200` means "succeeded, here is the result." It exists so a caller, or a test, can tell success from failure without first having to parse the response body at all.
- **JSON response body** — The actual data an HTTP response carries, written in JSON (JavaScript Object Notation) - a plain-text format built from the same nested objects, arrays, strings, numbers, and booleans Python's own dicts and lists already represent. It exists as this project's real, chosen format for handing structured data back to a caller, because it reads as plain text and nearly every mainstream language already knows how to parse it.

## Objects and methods used

- **`STLScaffoldService._extract_operation_num`**
  - *What it is:* A real, existing static method on this project's own `STLScaffoldService`, extracting a subprogram's leading operation-number digit from a string.
  - *Implementation:* `@staticmethod def _extract_operation_num(subprogram: str) -> str:` (`backend/app/services/stl_scaffold_service.py:231-246`) - strips a leading `O`/`o` off `subprogram`, then returns its first character if that character is a digit, otherwise the literal fallback `"0"`.
  - *Its use:* This lesson calls it directly, unmodified, as the one real specimen simple and self-contained enough to demonstrate exactly what a unit test checks - a function with no dependencies at all.
  - *Type:* A `@staticmethod` on the `STLScaffoldService` class - callable directly on the class itself, with no instance ever constructed.
  - *Responsibility:* Turning a raw subprogram-name string into the single digit identifying which numbered operation it belongs to, tolerating an optional leading `O`.
  - *Depends on:* Only its own `subprogram` argument - a plain string; nothing else.
  - *Connects to:* Called elsewhere inside `STLScaffoldService` while building scaffold items from real sequence data; this lesson's own lab calls it directly, independently of that real caller - and, per a real search of the whole backend this session, that real caller is the *only* other place in the entire codebase this function is referenced at all; nothing currently tests it directly.
  - *Shape:* Takes one string in, returns one short string out - a single digit normally, or the literal fallback `"0"` for anything with no leading digit - never a list, never `None`.

- **`create_app`**
  - *What it is:* This project's real Flask application factory function.
  - *Implementation:* `def create_app(config_name: str = None) -> Flask:` (`backend/app/__init__.py:172`) - builds a `Flask` instance, loads one of `config.py`'s real config classes by name, initializes SQLAlchemy, creates database tables, seeds default users, and registers every real blueprint through `register_routes`. Its own docstring, read this session, documents `create_app('testing')` as the intended pattern for tests specifically.
  - *Its use:* This lesson calls it with the real `"testing"` config name in every lab past the first, to get a fresh, safely-isolated app instance backed by an in-memory database.
  - *Type:* A module-level factory function (the Factory design pattern) - not a class, not a method on anything.
  - *Responsibility:* Producing one fully-configured, ready-to-use `Flask` application object from a bare config name, with no caller-visible global state left behind.
  - *Depends on:* A config name string - `"testing"`, `"development"`, or `"production"` - matched against `config.py`'s real `config` dict; with no argument at all, it defaults to `"development"`.
  - *Connects to:* Called by this lesson's integration- and system-level labs alike; internally calls `register_routes` (wiring in every real blueprint, including the one that ends up serving `/api/health`) and registers the direct `/health` route itself, inline.
  - *Shape:* Takes one optional string in, returns one fully-built `Flask` object out - never `None`, never a list of apps.

- **`Machine`**
  - *What it is:* A real SQLAlchemy model representing one CNC machine row in this project's own database.
  - *Implementation:* `class Machine(db.Model):` (`backend/app/models/machine.py:41`) - its real, `nullable=False` columns are `id` (`String(50)`, primary key), `name` (`String(100)`), `category` (`String(50)`), and `sub_type` (`String(50)`); every other column on the real model is optional.
  - *Its use:* This lesson constructs one real `Machine` row using exactly its required fields, to demonstrate a check that only makes sense once a real database is genuinely involved.
  - *Type:* A SQLAlchemy declarative model class - each instance maps to one real row in the real `machines` table.
  - *Responsibility:* Defining the real, permanent shape of a machine record, and giving Python code an object to construct, add, and query instead of writing raw SQL by hand.
  - *Depends on:* A real, connected `db` (SQLAlchemy) instance, bound to the Flask app's configured database.
  - *Connects to:* Constructed and handed to `db.session.add` in this lesson's own lab; queried back afterward, by primary key, through `db.session.get`.
  - *Shape:* A single Python object whose attributes mirror one row's real columns - not a dict, and never a list of rows.

- **`Session (db.session)`**
  - *What it is:* SQLAlchemy's real database session object, `db.session`, already wired up by this app's own `create_app`.
  - *Implementation:* An instance of SQLAlchemy's `Session` class, reached through Flask-SQLAlchemy's `db.session` proxy. `.add(obj)` stages a new object for insertion; `.commit()` writes every staged change to the real database in one real transaction; `.get(Model, primary_key)` fetches one row by its primary key, or returns `None` if no such row exists.
  - *Its use:* This lesson uses all three of these real methods together - add, commit, get - to prove a `Machine` row genuinely persisted, not just that constructing the Python object worked.
  - *Type:* A real, stateful object (SQLAlchemy's `Session`) - not a class, not a bare function; it remembers what's been staged between calls.
  - *Responsibility:* Tracking every object added to it, and coordinating a real transaction against the real (here, in-memory) database whenever told to commit.
  - *Depends on:* A live database connection, already configured by `create_app`; an active `app.app_context()` at the moment any of these are called.
  - *Connects to:* `.add` and `.commit` are called first, in this lesson's own lab, to persist a `Machine`; `.get` is called afterward, on the same session, to read it back.
  - *Shape:* `.add` and `.commit` return nothing (`None`); `.get` returns either one real model instance or `None` - never a list.

- **`Flask.test_client`**
  - *What it is:* A real method on Flask's own `Flask` class, returning a test client that can make requests against the app without a real network socket.
  - *Implementation:* `app.test_client()` - defined on Flask's base `Flask` class; returns a `FlaskClient` object exposing `.get`, `.post`, and every other real HTTP method, each simulating a real request through the app's actual routing.
  - *Its use:* This lesson calls it once per app, to get an object capable of making real `GET` requests against real routes, with no server process ever actually listening on a port.
  - *Type:* An instance method on `Flask`.
  - *Responsibility:* Simulating a real HTTP client against this exact app instance, so a full request-and-response cycle can be tested without starting an actual server process.
  - *Depends on:* A fully-built `Flask` app instance - this lesson's own `create_app("testing")` result.
  - *Connects to:* Returns a `FlaskClient`, whose `.get(...)` this lesson calls directly against both real health routes.
  - *Shape:* Takes nothing beyond the app itself (called with no arguments), returns one `FlaskClient` object out.

- **`Response (status_code / get_json)`**
  - *What it is:* The real response object Flask's test client returns from a simulated request.
  - *Implementation:* A Werkzeug/Flask `Response` object. `.status_code` is a plain integer attribute holding the real HTTP status the route returned; `.get_json()` is a real method that parses the response body as JSON and returns it as a plain Python dict (or `None` if the body isn't valid JSON).
  - *Its use:* This lesson reads both members off the same real response object - the status and the body - to fully characterize what each route actually returned.
  - *Type:* An object returned by a `FlaskClient` call - never constructed directly by this lesson's own code.
  - *Responsibility:* Carrying everything a real HTTP response would carry - status, headers, body - in one object a test can inspect directly, with no real network parsing required.
  - *Depends on:* The route function that handled the request; its return value is what Flask turns into this response.
  - *Connects to:* Produced by `client.get(...)`; both of its members are read directly in this lesson's own `print` and `assert` lines.
  - *Shape:* `.status_code` is a plain `int`; `.get_json()` is a plain `dict` (or `None`) - never the response body's raw bytes.

- **`time.perf_counter`**
  - *What it is:* A real function from Python's standard library `time` module, used for measuring short, real elapsed durations.
  - *Implementation:* `time.perf_counter() -> float` - returns a floating-point count of seconds from some unspecified fixed starting point; only the *difference* between two calls is meaningful, never the raw value by itself.
  - *Its use:* This lesson calls it before and after each of the three levels' real work, to measure genuinely how much wall-clock time each one costs.
  - *Type:* A function in the standard library's `time` module.
  - *Responsibility:* Providing the highest-resolution clock reading Python's standard library makes available, specifically meant for timing code - unlike `time.time()`, which is meant for real-world timestamps and can jump if the system clock itself is ever adjusted.
  - *Depends on:* Nothing - it takes no arguments.
  - *Connects to:* Called six times total in this lesson's own timing lab, in three before/after pairs; each pair's real difference becomes one level's measured duration.
  - *Shape:* Takes nothing in, returns one plain `float` out (seconds).

- **`health_check (direct route)`**
  - *What it is:* A real, existing Flask view function registered directly on the app object itself, not through any blueprint.
  - *Implementation:* `@app.route('/health') def health_check(): ...` (`backend/app/__init__.py:426-439`) - returns a plain dict, `{'status': 'healthy', 'message': 'Manufacturing Platform API is running'}`, which Flask automatically converts into a real JSON response.
  - *Its use:* This lesson calls the real, live URL this function serves, `/health`, through the test client, without modifying it.
  - *Type:* A Flask view function, registered with `@app.route` directly on `app` - not a blueprint route.
  - *Responsibility:* As its own real comment states, answering a fast, minimal "is this API alive" check for monitoring tools and load balancers.
  - *Depends on:* Nothing beyond being registered on the `app` object during `create_app`.
  - *Connects to:* Reached directly by any client requesting `/health`; registered before `register_routes` is even called, so it exists independently of every blueprint in the app.
  - *Shape:* Returns a plain Python dict with two real keys, `status` and `message` - no `version` key.

- **`health_check (blueprint route)`**
  - *What it is:* A second, real, existing Flask view function - sharing the same Python name as the one above, but declared inside its own blueprint.
  - *Implementation:* `@health_bp.route('/health', methods=['GET']) def health_check(): ...` (`backend/app/routes/health.py:5-12`) - returns `{'status': 'online', 'message': 'Manufacturing Data Platform Backend is ready.', 'version': '1.0.0'}`.
  - *Its use:* This lesson calls the real, live URL this function actually serves once registered - not `/health`, but `/api/health`, because of the `url_prefix='/api'` its blueprint is registered with.
  - *Type:* A Flask view function, registered on a `Blueprint` object (`health_bp`), not directly on `app`.
  - *Responsibility:* The same conceptual job as the other `health_check` above - reporting that the backend is alive - implemented completely independently, with its own different real response shape.
  - *Depends on:* `health_bp` actually being registered by `register_routes` (`backend/app/routes/__init__.py:15-16`), with the `url_prefix='/api'` argument that determines its real, final URL.
  - *Connects to:* Reached only at `/api/health`, never at bare `/health` - the two functions never actually collide at runtime, despite sharing a name and a superficially similar purpose.
  - *Shape:* Returns a plain Python dict with three real keys, `status`, `message`, and `version` - one more key than the other `health_check`.

- **`jsonify`**
  - *What it is:* A real function from the Flask package that converts a Python value into a real Flask `Response` carrying a JSON body.
  - *Implementation:* `flask.jsonify(*args, **kwargs)` - builds a JSON-encoded response body from the value(s) passed in, and sets the response's `Content-Type` header to `application/json`.
  - *Its use:* This lesson sees it used in one of the two real health routes (`backend/app/routes/health.py`), and sees the other real route deliberately not use it at all - a real, verified difference in how the two produce their JSON.
  - *Type:* A function, imported from the `flask` package.
  - *Responsibility:* Turning a plain Python value into a properly-formed JSON HTTP response, with the correct header, instead of leaving a caller to build that response by hand.
  - *Depends on:* A value that can actually be serialized to JSON - here, a plain dict of strings.
  - *Connects to:* Called and returned directly inside `health.py`'s own `health_check`; the other `health_check`, in `app/__init__.py`, returns a plain dict instead and lets Flask convert it automatically - both real routes end up producing real JSON, by two different real paths.
  - *Shape:* Takes a plain Python value in, returns one real Flask `Response` object out, already carrying a JSON body.

- **`test_xml_import`**
  - *What it is:* A second real, already-existing "test" script in this project, similar in spirit to `test_xml_parser.py`'s `test_parser`, but for the database-import path specifically.
  - *Implementation:* `def test_xml_import():` (`backend/test_schema.py:15`) - calls `create_app()` with no `config_name` argument, deletes several real tables' worth of rows (`Operation.query.delete()`, `Sequence.query.delete()`, `CAMFile.query.delete()`, `Part.query.delete()`, `Machine.query.delete()`), inserts new ones, then parses and imports a real sample XML file.
  - *Its use:* This lesson uses it as real evidence that this project already has an integration-shaped script - one that genuinely crosses the database boundary - and as a preview of a real, serious problem with it that this curriculum returns to directly in a later lesson.
  - *Type:* A standalone module-level function, defined at `backend/test_schema.py:15`.
  - *Responsibility:* As written, deleting and rebuilding a fixed set of real rows, then exercising the real XML-import path against them - with no `assert` anywhere in it either, the same gap `test_parser` had.
  - *Depends on:* `create_app()` called with no argument at all, which (per `create_app`'s own real default, read this session) resolves to `"development"`, not `"testing"` - meaning this real script deletes and inserts rows against the real, on-disk database file `config.py` points `DevelopmentConfig` at, not a safe, in-memory one.
  - *Connects to:* Called from this file's own `if __name__ == '__main__':` guard; deletes from and writes to whatever real database `create_app`'s default config actually resolves to.
  - *Shape:* Returns nothing; its real effect is entirely in the rows it deletes and inserts in a real database - not a return value a caller could check.

## Concept Unit: Unit Test - One Function, Nothing Else

### The Problem

This project's real `STLScaffoldService._extract_operation_num` pulls an operation number out of a subprogram string while building STL scaffolds. A real search of the entire backend this session turns up exactly one reference to it in the whole codebase - its own definition. Nothing tests it, directly or otherwise. What would it even mean to check this one function, and only this one function, without touching anything else the app depends on?

Before reading on:

- Look at `STLScaffoldService._extract_operation_num`'s real signature: `(subprogram: str) -> str`. Does calling it require a running Flask app, a database, or a network connection? What does that tell you about what a check against it would - and would not - need?
- If this function were wrong, could you find out by running it directly, without ever starting the rest of the backend? What would that actually look like, concretely?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `backend/app/services/stl_scaffold_service.py:231-246` (`STLScaffoldService._extract_operation_num`), read in full this session. A real search of the whole backend this session (`grep -r "_extract_operation_num" backend/`) found exactly one match: the function's own definition.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** `backend/app/services/stl_scaffold_service.py` must be importable - this lab runs with the manufacturing-platform repo's own `backend/` directory on `sys.path`, the same layout `backend/test_xml_parser.py:11` itself already relies on.

### The New Code

The smallest possible unit-level check: import the real function, call it directly, compare the result to a real expectation.

**File:** `verification/phase-02/lab_unit_test.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app.services.stl_scaffold_service import STLScaffoldService

assert STLScaffoldService._extract_operation_num("O1103") == "1"
assert STLScaffoldService._extract_operation_num("O2104") == "2"
assert STLScaffoldService._extract_operation_num("1103") == "1"
print("all unit-level checks passed - no Flask, no database, no network, just this one function")
```

### Mechanical Walkthrough

- `sys.path.insert(0, "backend")` — Inserts `"backend"` at the very front of Python's own list of directories it searches when resolving an import, so `from app...` below resolves against the real backend package without it ever being installed - the identical mechanism `backend/test_xml_parser.py:11` itself already relies on (`sys.path.insert(0, str(Path(__file__).parent))`), just pointed at a relative path instead of a computed one.
- `from app.services.stl_scaffold_service import STLScaffoldService` — An import statement reaching directly into the real project package and pulling in the real, unmodified class this lesson is about to call a method on.
- `STLScaffoldService._extract_operation_num("O1103")` — Calls the real static method directly on the class itself - no `STLScaffoldService()` instance is ever constructed, because a `@staticmethod` needs none.
- `== "1"` — A string equality comparison; the right-hand side is this unit's own stated expectation for this specific input.
- `assert ... == "1" / == "2" / == "1" (three calls)` — Three separate `assert` statements, each calling the real function with a different real input - a leading-zero-style code, a two-digit operation prefix, and an input with no `O` prefix at all - checking the function's stated behavior against three genuinely different real shapes it has to handle.
- `print("all unit-level checks passed ...")` — Reached only if every `assert` above passed; a plain string, not an f-string, since nothing here needs to be computed.

### Execution Trace

```
input: "O1103"
.lstrip('O'): "O1103" -> "1103"  (leading O removed)
.lstrip('o'): "1103" -> "1103"  (no lowercase o present, unchanged)
num[0]: "1103"[0] -> "1"
"1".isdigit(): True -> return "1"
```

### CS Lens

This is **unit testing**: exercising one piece of code in complete isolation, the base of the classic "test pyramid." Also recognized in: the entire xUnit family of frameworks (JUnit, Jest, and pytest itself, which this curriculum reaches next); pure-function testing in functional languages, where a function with no side effects can be checked against nothing but its own inputs and outputs; a mathematical proof restricted to one function's own domain; and, in this project's own domain, a CNC subroutine's macro logic checked on the controller in isolation before it is ever wired into a full program.

### SE Lens

The design principle is fast, deterministic feedback located as close to the code as possible. The real alternative already in use in this project is exactly what the search above proves: this function is currently only ever exercised indirectly, as one small step inside building a full scaffold from real sequence and operation data pulled out of the database. The honest cost of that alternative: the only way this project could currently notice a bug in this exact function is by running the whole scaffold pipeline against real data and noticing a wrong operation grouping downstream - and a wrong result there could just as easily be blamed on a dozen other things the pipeline does. The honest cost of the unit test built here instead: passing it proves this one narrow behavior works for the inputs actually checked - it says nothing about whether the function's real caller ever passes it the right kind of string in the first place.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_unit_test.py` — Runs the lab with this project's own backend virtual environment's Python, from the manufacturing-platform repository root - needed here (unlike a bare stdlib-only script) because importing `app.services...` pulls in this project's real dependencies, such as SQLAlchemy, even though this particular function never uses them itself.

### Verification

```text
all unit-level checks passed - no Flask, no database, no network, just this one function
```

Full saved run: `verification/phase-02/lab_unit_test_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the narrowest possible scope, against a real, currently-untested piece of this project's own code, that every later unit in this lesson widens outward from.

## Concept Unit: Integration Test - Crossing a Real Boundary

### The Problem

This project already has one real, existing attempt at exactly this idea: `backend/test_schema.py`'s `test_xml_import` deletes and inserts real rows against whatever real database `create_app()` happens to point at. A unit test could never check whether a `Machine` row genuinely persists - that question only exists once a real database is actually involved.

Before reading on:

- `Machine` is a real SQLAlchemy model with real, required columns. Could you meaningfully check whether a `Machine` row "persists" without ever touching an actual database - even an in-memory one?
- Given this lesson's own unit-test unit, what specifically is different here that a plain function call could never exercise on its own?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `backend/app/models/machine.py:41-80` (`Machine`), read in full this session. Real, already-existing evidence for this exact idea, done badly: `backend/test_schema.py:15` (`test_xml_import`), read in full this session - it deletes and inserts real rows with `create_app()` called with no argument at all, which resolves to the real, on-disk development database, not a safe, in-memory one.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** A real, importable `backend/` directory on `sys.path`, the same as the previous unit.

### The New Code

A real `Machine` row, built, committed, and read back - against a real, in-memory test database, never the real on-disk one `test_xml_import` touches:

**File:** `verification/phase-02/lab_integration_test.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")

with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis")
    db.session.add(machine)
    db.session.commit()

    fetched = db.session.get(Machine, "M-TEST-001")
    assert fetched is not None
    assert fetched.name == "Test Mill"
    assert fetched.category == "mill"
    print("integration-level check passed - required a real app, a real database session, and a real committed row")
```

### Mechanical Walkthrough

- `from app import create_app, db` — Imports this project's real app factory and its real, already-configured SQLAlchemy `db` instance together - both are needed here, unlike the previous unit, which needed neither.
- `from app.models.machine import Machine` — Imports the real, unmodified model class this unit is about to construct a real row from.
- `create_app("testing")` — Builds a real `Flask` app using the real `TestingConfig`, which points `SQLALCHEMY_DATABASE_URI` at `sqlite:///:memory:` - a real database that exists only for this one process, never the real file `test_xml_import` would have touched.
- `with app.app_context():` — Makes this specific app "current" for every indented line below it, so `db.session` resolves against this app's real, in-memory database rather than raising an error for having no app context to work with at all.
- `machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis")` — Constructs one real `Machine` object in memory, supplying exactly its four real, `nullable=False` columns; nothing has been written to the database yet - this is still a plain Python object.
- `db.session.add(machine)` — Stages `machine` on the real session for insertion; still nothing durable has happened to the database itself.
- `db.session.commit()` — The one line that actually writes the staged row into the real (if in-memory) `machines` table, inside a real transaction.
- `fetched = db.session.get(Machine, "M-TEST-001")` — Issues a real query against that same database, by primary key, and gets back a real `Machine` instance built from the row's own columns - the concrete proof the commit above really did persist it.
- `assert fetched is not None` — Checks that a row was actually found at all - `db.session.get` would have returned `None` here if the commit had silently failed to persist anything.
- `assert fetched.name == "Test Mill" / assert fetched.category == "mill"` — Two further checks reading real attributes off the object `db.session.get` returned, confirming the values that came back out of the database are the same ones that went in.
- `print("integration-level check passed ...")` — Reached only if every `assert` above passed, including the three that specifically required the database round-trip to have worked.

### Execution Trace

1. `create_app("testing")` - builds the real app on `TestingConfig`; internally also runs `db.create_all()` and `seed_users()` inside its own `app.app_context()`, which is why `Seeding default users...` appears in this lab's own real output even though this lab never asked for that directly.
2. `with app.app_context():` - makes this app "current" for everything indented under it, so the calls below resolve against its real, in-memory database.
3. `machine = Machine(...)` - builds one real, in-memory Python object; the database itself is not touched yet.
4. `db.session.add(machine)` - stages `machine` for insertion; still nothing durable has happened.
5. `db.session.commit()` - only this line actually writes the row into the real database, inside a real transaction.
6. `db.session.get(Machine, "M-TEST-001")` - issues a real query against that same database and gets back a real `Machine` instance - the step that could only ever fail if the commit above had not genuinely persisted anything.

### CS Lens

This is an **integration test**: exercising real code together with a real collaborator to confirm the two actually cooperate. Also recognized in: any ORM's own integration test suite, run against a real (if disposable) database; a message-queue producer/consumer pair tested against a real local broker instead of a mock; a payment gateway's official sandbox environment; and, in this project's own domain, a CNC post-processor's output tested against a real machine controller's simulator before it is ever trusted to cut real material.

### SE Lens

The design principle is trusting only what has actually been exercised against the real dependency, not merely against a stand- in for it. The real alternative not chosen here - stubbing out `db.session` entirely so no real database is ever touched - is faster, but proves nothing about whether `Machine`'s real columns, real constraints, and this project's real database driver actually cooperate the way the code assumes; this curriculum returns to that alternative directly, by name, in a later lesson. The honest cost of what is built here instead: it is slower than a unit test and needs real setup (an app, a database) - but it is the only one of the two that can actually prove persistence itself works. And the real, existing `test_xml_import` is the sharper cautionary tale: it crosses the same real database boundary, but against the real, on-disk database, with real destructive deletes and no isolation at all - the honest cost of getting this scope decision right without also getting the safety of *how* right.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_integration_test.py` — Runs the lab with this project's own backend virtual environment's Python, from the repository root.

### Verification

```text
Seeding default users...
integration-level check passed - required a real app, a real database session, and a real committed row
```

Full saved run: `verification/phase-02/lab_integration_test_output.txt`.

### Connection to the previous unit

The previous unit checked one function with zero real collaborators; this unit checks the smallest possible number of real collaborators greater than zero - one real database - which is exactly the line the Terms section draws between "unit" and "integration."

## Concept Unit: System Test - Through the Front Door

### The Problem

This project has two real functions, both named `health_check`, both apparently reporting whether the backend is alive: `backend/app/__init__.py:426-439` and `backend/app/routes/health.py:5-12`. Reading only their source, are they duplicates, in genuine conflict, or something else entirely? Neither this lesson's unit test nor its integration test could ever answer that - answering it requires going through the exact thing a real caller would actually use: an HTTP request, routed by the whole app.

Before reading on:

- Reading just the two function bodies below, both seem to do roughly the same job. What would you actually need to run to find out whether they conflict, cooperate, or never even meet?
- If you called `health_check()` directly, as a plain Python function, would that tell you anything at all about which real URL a client would have to request to actually reach it?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimens, both read in full this session: `backend/app/__init__.py:426-439` and `backend/app/routes/health.py:5-12`, plus the real registration line that determines the second one's actual URL, `backend/app/routes/__init__.py:15-16` (`app.register_blueprint(health_bp, url_prefix='/api')`).
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** A real, importable `backend/` directory on `sys.path`, the same as the previous two units.

### The New Code

Real HTTP requests, through a real test client, against both real health routes - shown alongside both routes' own real source, since this unit's whole point is a real difference in how they behave:

**File:** `verification/phase-02/lab_system_test.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app

app = create_app("testing")
client = app.test_client()

r1 = client.get("/health")
print("GET /health ->", r1.status_code, r1.get_json())

r2 = client.get("/api/health")
print("GET /api/health ->", r2.status_code, r2.get_json())

assert r1.get_json() != r2.get_json(), "expected these two real endpoints to differ"
print("system-level check passed - went through real HTTP routing, not a direct function call")
```

**File:** `backend/app/routes/health.py` (already exists — read-only, nothing to type)

```python
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check to verify backend is running."""
    return jsonify({
        'status': 'online',
        'message': 'Manufacturing Data Platform Backend is ready.',
        'version': '1.0.0'
    })
```

**File:** `backend/app/__init__.py` (already exists — read-only, nothing to type)

```python
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'message': 'Manufacturing Platform API is running'}
```

### Mechanical Walkthrough

- `app = create_app("testing") / client = app.test_client()` — Builds a real app, then a real test client bound to it - after this line, `client.get(...)` will really run this app's own real routing for every request, exactly as a deployed server would.
- `r1 = client.get("/health")` — Sends a real, simulated `GET` request to `/health`. Werkzeug's own routing decides which real registered route actually handles it - here, the one registered directly on `app`, not the blueprint one.
- `r1.status_code` — Reads the real integer HTTP status code the route's response carries - printed here to show it succeeded before its body is even inspected.
- `r1.get_json()` — Parses the real response body as JSON, returning a plain Python dict - `{'status': 'healthy', 'message': 'Manufacturing Platform API is running'}`, matching the plain dict the route function itself returned.
- `r2 = client.get("/api/health")` — A second, independent simulated request - this time to `/api/health`, which real routing sends to the blueprint's own `health_check` instead, because that is the real URL its blueprint was actually registered under.
- `assert r1.get_json() != r2.get_json(), "..."` — Compares the two real, already-fetched JSON bodies directly; `!=` is `True` here because the two dicts genuinely differ - proof, not assumption, that these are two separate real endpoints with two separate real response shapes.
- `Blueprint('health', __name__)` — Constructs a real Flask `Blueprint` named `'health'` - a grouping of routes that can be registered onto an app later, optionally under a URL prefix, which is exactly what `register_routes` does to it.
- `@health_bp.route('/health', methods=['GET'])` — Registers this function against the path `/health` *relative to the blueprint*, accepting only `GET` requests - its real, final URL is decided later, by whatever prefix the blueprint is registered with.
- `return jsonify({...}) (health.py)` — Explicitly builds a real Flask `Response` with the correct `application/json` header via `jsonify`, carrying three real keys: `status`, `message`, `version`.
- `@app.route('/health') (app/__init__.py)` — Registers this second, different function directly on the `app` object at the literal path `/health` - no blueprint, no prefix, so its real URL is exactly what it says.
- `return {...} (app/__init__.py, no jsonify)` — Returns a plain Python dict with two real keys, `status` and `message`; Flask automatically converts a returned dict into a real JSON response on its own, so this route reaches the same real outcome as the other one's explicit `jsonify` call, by a different real path through Flask's own code.

### Mental Model

```text
client.get("/health")                 client.get("/api/health")
       |                                        |
       v                                        v
Werkzeug routing (registered on app,      Werkzeug routing (registered on
no blueprint, no prefix)                  health_bp, url_prefix='/api')
       |                                        |
       v                                        v
app/__init__.py health_check()           app/routes/health.py health_check()
return {...}  (2 keys, no version)        return jsonify({...})  (3 keys)
```

### CS Lens

This is a **system test**: exercising the whole application through the same real interface an actual caller would use. Also recognized in: end-to-end browser tests driving a real UI against a real backend; an API contract test hitting a real staging deployment; a smoke test run against a freshly-deployed service before it's allowed to take real traffic; and, in this project's own domain, running a complete real NC program on an actual machine controller, rather than checking any one line of it in isolation.

### SE Lens

The design principle is testing at the exact seam a real caller actually crosses - here, HTTP routing - because that seam is precisely where a unit test or an integration test structurally cannot see a problem: both of this lesson's earlier units call real code directly, by name, which a real HTTP client never does. The real alternative not chosen - reading the two `health_check` functions' source and reasoning about what URL each one "should" serve - is exactly what this unit's own Problem showed failing: nothing in either function's own body says which real URL reaches it; that fact lives one file away, in a blueprint registration call. The honest cost of the system test built here: it is the slowest and heaviest of the three levels in this lesson (the next unit measures exactly how much), and a passing system test still does not, by itself, explain *why* something is wrong the way a failing unit test - pointing at one specific function - already does.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_system_test.py` — Runs the lab with this project's own backend virtual environment's Python, from the repository root.

### Verification

```text
Seeding default users...
GET /health -> 200 {'message': 'Manufacturing Platform API is running', 'status': 'healthy'}
GET /api/health -> 200 {'message': 'Manufacturing Data Platform Backend is ready.', 'status': 'online', 'version': '1.0.0'}
system-level check passed - went through real HTTP routing, not a direct function call
```

Full saved run: `verification/phase-02/lab_system_test_output.txt`.

### Connection to the previous unit

The previous unit crossed one real boundary (a database); this unit crosses every boundary the app has at once - routing, blueprints, view functions - by using the one real interface that forces all of them to actually participate: a real HTTP request.

## Concept Unit: Choosing the Right Level - What the Real Numbers Say

### The Problem

Given three real ways to check this project's behavior - a direct function call, a real database, a real HTTP request - which one should be reached for, and when? Cost is one real, measurable factor test design has to weigh, not only what each level happens to prove.

Before reading on:

- Before reading the real numbers below: which of this lesson's three checks do you expect to be fastest? Which do you expect to be slowest? Why?
- If a check needs a real database row to exist before it can even ask its real question, could that check ever honestly be called a unit test, no matter how it's written?

### Project Change

- **Reference Source:** No reference counterpart - this unit's own code is the comparison itself, timing the same three real specimens already built in this lesson's earlier units: `backend/app/services/stl_scaffold_service.py:231-246`, `backend/app/models/machine.py:41-80`, and the two real `/health` routes cited in the previous unit.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** A real, importable `backend/` directory on `sys.path`, the same as every earlier unit in this lesson.

### The New Code

The first version of this script imported each level's real dependencies right before timing it, and measured the unit-level check at roughly 487 ms - almost entirely the one-time cost of Python importing `app.services...` for the very first time, not the cost of the check itself. Every import below was moved to the top, run once, before any clock starts - the same thing pytest itself does at collection time, not per test - so each timed block below measures only its own real work:

**File:** `verification/phase-02/lab_compare_speed.py` (new)

```python
import sys
import time

sys.path.insert(0, "backend")

# Import everything up front - a one-time cost every level pays alike
# (this is also how pytest itself works: imports happen once at
# collection, not re-paid inside every individual test), so it should
# not be charged against any one level's own number below.
from app.services.stl_scaffold_service import STLScaffoldService
from app import create_app, db
from app.models.machine import Machine

# --- unit level: no setup at all ---
start = time.perf_counter()
assert STLScaffoldService._extract_operation_num("O1103") == "1"
unit_seconds = time.perf_counter() - start

# --- integration level: a real app, a real database session ---
start = time.perf_counter()
app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-SPEED-001", name="Speed Test Mill", category="mill", sub_type="3_axis")
    db.session.add(machine)
    db.session.commit()
    fetched = db.session.get(Machine, "M-SPEED-001")
    assert fetched is not None
integration_seconds = time.perf_counter() - start

# --- system level: a real app, real HTTP routing, two real requests ---
start = time.perf_counter()
app2 = create_app("testing")
client = app2.test_client()
r1 = client.get("/health")
r2 = client.get("/api/health")
assert r1.status_code == 200 and r2.status_code == 200
system_seconds = time.perf_counter() - start

print(f"unit:        {unit_seconds * 1000:.3f} ms")
print(f"integration: {integration_seconds * 1000:.3f} ms  ({integration_seconds / unit_seconds:.0f}x the unit check)")
print(f"system:      {system_seconds * 1000:.3f} ms  ({system_seconds / unit_seconds:.0f}x the unit check)")
```

### Mechanical Walkthrough

- `from app.services... / from app import ... / from app.models... (all at the top)` — All three real imports run once, before the first `time.perf_counter()` call - deliberately, per this unit's own intro, so the one-time cost of Python loading these modules for the first time is paid before timing starts, not charged against whichever level happened to import first.
- `start = time.perf_counter() (first pair)` — Records the real clock reading immediately before the unit- level check's own work begins.
- `unit_seconds = time.perf_counter() - start` — Records the clock again immediately after, and subtracts - the real elapsed time for exactly one call to `_extract_operation_num`, with its own `assert`.
- `app = create_app("testing") (second block)` — Rebuilds a fresh app for the integration check - the same real, non-trivial work (config loading, table creation, user seeding) this lesson's own integration unit already showed in full.
- `with app.app_context(): ... db.session.add/commit/get (second block)` — The same real persist-then-read sequence as the integration unit, timed this time instead of merely demonstrated.
- `integration_seconds = time.perf_counter() - start` — The real elapsed time for building a fresh app *and* persisting *and* reading back one real row - all counted together, because that is genuinely what running this check costs.
- `app2 = create_app("testing") / client = app2.test_client() (third block)` — A second, independent fresh app (named `app2` so it's never confused with the integration block's own `app`), then a real test client bound to it.
- `r1 = client.get("/health") / r2 = client.get("/api/health") (third block)` — The same two real requests the system-test unit already made, timed this time instead of inspected.
- `system_seconds = time.perf_counter() - start` — The real elapsed time for building a fresh app and sending two real, routed HTTP requests through it.
- `f"unit: {unit_seconds * 1000:.3f} ms"` — An f-string with a format specifier, `:.3f`, formatting the real float to exactly three decimal places; `* 1000` converts real seconds into real milliseconds, since the unit check's own number is otherwise too small to read comfortably as seconds.
- `integration_seconds / unit_seconds` — Divides one real measured duration by another, producing the real ratio printed alongside each slower level's own millisecond figure.

### Execution Trace

```
unit:        0.002 ms   (a single direct call and comparison, nothing else)
integration: 451.200 ms  (225600x the unit check - a fresh app, table creation, a real commit, a real query)
system:      364.218 ms  (182109x the unit check - a second fresh app, real routing, two real requests)
```

### CS Lens

This is the **test pyramid**: the empirical observation that checks with a narrower scope are, in real, measured practice, also dramatically cheaper to run - not merely a diagram someone drew. Also recognized in: Martin Fowler's own writing on this exact shape; a CI pipeline deliberately staging its fastest checks first, so a broken build fails in seconds rather than minutes; a database query planner favoring the cheapest index that can still answer a given question; and, in this project's own domain, a quick, in-process tool-offset check run before committing to a full, real first-article proveout on the machine itself.

### SE Lens

The design principle is paying for real confidence only at the scope a given question actually needs, given that this project's own measured numbers put five whole orders of magnitude between the cheapest and the more expensive levels. The real alternative not chosen - writing every check at the system level "to be safe" - has a real, now-measured cost: this project's own numbers show that would make a check on logic as simple as `_extract_operation_num` roughly 180,000 times slower than it needed to be. The honest limit on this principle, stated plainly: cost is not the only factor. A system test proves something - real routing, a real blueprint prefix - that no unit test can prove no matter how fast it runs; picking a level is a real tradeoff between speed and what the check can actually see, not a rule that the fastest check always wins.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_compare_speed.py` — Runs the lab with this project's own backend virtual environment's Python, from the repository root.

### Verification

```text
Seeding default users...
Seeding default users...
unit:        0.002 ms
integration: 451.200 ms  (225600x the unit check)
system:      364.218 ms  (182109x the unit check)
```

Full saved run: `verification/phase-02/lab_compare_speed_output.txt`.

### Connection to the previous unit

The previous three units each showed what one level of testing actually requires and actually proves; this unit puts a real number on what each of those three levels actually costs, turning "unit tests are faster" from a plausible claim into something this project's own measured evidence backs up.

## Connect the pieces

One real, currently-untested function - `_extract_operation_num` - checked directly, in isolation, in about two microseconds, with no real collaborator involved at all: a unit test. One real `Machine` row, built, committed, and read back from a real (if in-memory) database, at roughly four hundred and fifty milliseconds - a check that could only exist once one real collaborator, a database, was let in: an integration test. Two real functions, both named `health_check`, both looking like duplicates from their source alone - shown, this lesson proved, to live at two different real URLs with two different real JSON shapes, discoverable only by actually routing a real HTTP request to each one: a system test. And the same three real checks, timed for real in one script, showing a gap of five orders of magnitude between the cheapest and the others - not asserted, measured, from this project's own real, saved numbers. Three different real answers to the same question - "how much of the real system does this check let in?" - is the entire taxonomy this lesson set out to build.

**Next lesson:** Every check built in this lesson used a bare `assert` statement, deliberately, to keep the idea of a check itself separate from any framework's own machinery. Next, that machinery gets a name and a real toolset of its own - test discovery, real assertions with far better failure output than a bare `assert` gives, fixtures for exactly the kind of repeated app-and-database setup this lesson's own integration and system checks needed by hand, and parametrization for running the same check against many real inputs at once.