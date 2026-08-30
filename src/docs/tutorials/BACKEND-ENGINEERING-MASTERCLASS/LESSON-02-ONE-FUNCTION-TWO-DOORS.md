# Lesson 2: One Function, Two Doors

*File paths under `backend/...` refer to the real legacy app; paths
under `rebuild/...` and `verification/...` refer to the
`manufacturing-platform` repository's rebuild and verification folders
— all in the `manufacturing-platform` repository.*

**What you will build:** A real, new, minimal Flask app — the actual
start of the rebuild — with one real route implementation shared by
both of the legacy app's two existing health-check URLs, proven with a
real, passing test. The transferable problem: two callers currently
reach two different, independently-written answers to the same real
question; the fix isn't picking a side and deleting the other door —
it's keeping both doors open and putting one, single room behind them.

**What you need to know first:** A Flask route and blueprint; an HTTP
response's JSON body; the idea that the same piece of real knowledge
written down twice can quietly drift apart (already shown concretely in
this curriculum's own characterization of this exact bug).

## Terms used in this lesson

- **Duplication** — the same real knowledge, expressed independently in
  two or more places in a codebase, with nothing forcing them to stay
  in agreement. It's the concrete problem this lesson fixes: not "two
  functions that happen to look similar," but two functions answering
  the exact same real question, already proven (by real, passing tests)
  to have already drifted apart.
- **Refactor** — restructuring existing code's internal shape *without
  changing its observable behavior* — same inputs still produce the
  exact same outputs, just from a different, usually simpler or less
  duplicated internal structure. It matters here because what this
  lesson does is deliberately **not** a pure refactor: a refactor alone
  can't fix this bug, since the two current behaviors already disagree
  with each other — preserving both exactly as they are would mean
  keeping the very inconsistency being fixed. This lesson does a
  refactor (extracting one shared implementation) **plus** one small,
  explained, deliberate behavior change (unifying what each door
  returns) — the two are different things, and conflating them is
  exactly the mistake this Term entry exists to head off.
- **Interface** — the part of a route's contract an external caller can
  see and depend on from outside the codebase: reachable at this URL, by
  this HTTP method, returning JSON shaped like this — as opposed to how
  it's implemented internally, which no external caller can see or
  should have to care about. It matters here because this lesson's real
  decision is: keep both real interfaces (`/health` and `/api/health`)
  reachable exactly as before, since something outside this codebase
  might already depend on either URL existing — while changing what's
  behind them.
- **Single source of truth** — a rule that any one piece of real
  knowledge should be written down, and be changeable, in exactly one
  place, so every consumer of that knowledge is automatically kept in
  agreement instead of relying on separate places being updated
  together by hand.
- **Extract Function** — a specific, named refactoring technique: taking
  code that's duplicated (or about to be) across two or more places, and
  moving it into one new, separately-named function that both places
  call instead. It exists because duplicated logic can't be fixed in one
  place — every future fix has to remember to touch every copy, and
  "remembering to touch every copy" is exactly the kind of thing a real
  codebase, over enough time, eventually fails to do.

## Objects and methods used

- **`Blueprint`**
  - *What it is:* A Flask class representing a named, separately-defined
    group of routes, registered into a real app later.
  - *Implementation:* `flask.Blueprint(name: str, import_name: str)`.
  - *Its use:* The rebuild's `health.py` builds one (`health_bp`) exactly
    the same way the legacy app does, so its two routes can be defined
    together and registered into the rebuild app in one call.
  - *Type:* A class, instantiated once at module load time.
  - *Responsibility:* Hold a set of routes and handler functions,
    independent of any specific running app, until registered.
  - *Depends on:* A name and an `import_name`.
  - *Connects to:* `rebuild_app/routes/health.py` constructs it;
    `@health_bp.route(...)` (below) adds routes to it;
    `register_blueprint` (below) wires it into the real rebuild app.
  - *Shape:* A framework-provided seam between "a group of related
    routes" and "the one running application" — it's what lets
    `health.py` exist as its own file, separate from the app that
    eventually runs it.

- **`Blueprint.route`**
  - *What it is:* A method registering a URL rule and returning a
    decorator for the function that handles it.
  - *Implementation:* `route(rule: str, methods: list[str] = ["GET"])`
    — called twice here, as `@health_bp.route('/health', ...)` and
    `@health_bp.route('/api/health', ...)`.
  - *Its use:* This lesson's real fix depends on this being callable
    more than once on the same blueprint, for two different paths,
    each wrapping a different function name that both call the same
    shared logic underneath.
  - *Type:* An instance method, used via decorator syntax.
  - *Responsibility:* Record "this rule, these methods, call this
    function" against the blueprint.
  - *Depends on:* A path string and the function it decorates.
  - *Connects to:* Called twice in this lesson's real code; consulted by
    Flask on every incoming request to either path.
  - *Shape:* The public entry point turning a plain function into a
    reachable endpoint — used here twice, against the same one shared
    implementation underneath both.

- **`jsonify`**
  - *What it is:* A Flask function converting a Python value into a real
    JSON HTTP response.
  - *Implementation:* `flask.jsonify(*args, **kwargs) -> Response`.
  - *Its use:* Both of this lesson's two route functions call it on the
    exact same dictionary, returned by the one shared helper function
    (New Code, below) — proving, by construction, that both doors return
    identical bodies.
  - *Type:* A free function.
  - *Responsibility:* Serialize the given value to JSON and set the
    correct `Content-Type`.
  - *Depends on:* A JSON-serializable value.
  - *Connects to:* Called inside both `health_check` and
    `health_check_api`, below.
  - *Shape:* The seam between "a Python value" and "a real, spec-shaped
    HTTP response" — what a route handler is expected to return.

- **`Flask.register_blueprint`**
  - *What it is:* An instance method copying a `Blueprint`'s recorded
    routes into a real `Flask` app's routing table.
  - *Implementation:* `register_blueprint(blueprint: Blueprint,
    url_prefix: str = None)` — called here with no `url_prefix`, unlike
    the legacy app's call (which used `url_prefix='/api'`), because this
    blueprint's own two routes already spell out `/health` and
    `/api/health` in full.
  - *Its use:* Wires `health_bp`'s two real routes into the rebuild's
    real app.
  - *Type:* An instance method on `Flask`.
  - *Responsibility:* For every route the blueprint recorded, register
    the same mapping on the real app.
  - *Depends on:* A `Blueprint` with routes already recorded.
  - *Connects to:* Called once, inside `create_app` (below).
  - *Shape:* The seam between "a blueprint, defined in its own file" and
    "a real app that actually answers requests" — where the two become
    one.

- **`create_app`** (the rebuild's own)
  - *What it is:* A new application factory — an ordinary Python
    function building and returning one real, fully-assembled `Flask`
    app — for the rebuild specifically, separate from the legacy app's
    own `create_app`.
  - *Implementation:* `create_app() -> Flask`, defined at
    `rebuild/rebuild_app/__init__.py`.
  - *Its use:* This lesson's test calls it to get a real, running
    instance of the rebuild app to test against.
  - *Type:* A free function.
  - *Responsibility:* Build one `Flask` instance and register every real
    blueprint the rebuild has so far (currently: just `health_bp`).
  - *Depends on:* Nothing yet — no config name, unlike the legacy
    version, because the rebuild has no separate testing/development
    configuration to choose between yet; that gets added only once a
    future lesson's feature actually needs one.
  - *Connects to:* Called by this lesson's test; will be called by every
    future rebuild lesson's own tests too, as more gets registered into
    it over time.
  - *Shape:* The real, single starting point for the entire rebuild
    application — the first piece of it that now exists.

- **`Flask.test_client` / `FlaskClient.get`**
  - *What it is:* `test_client()` builds an in-process HTTP simulator for
    a `Flask` app; `.get(path)` makes one simulated request.
  - *Implementation:* `Flask.test_client() -> FlaskClient`;
    `FlaskClient.get(path: str) -> Response`.
  - *Its use:* This lesson's test calls both real paths through it,
    entirely in-process, to prove they now agree.
  - *Type:* Instance methods.
  - *Responsibility:* Run a request through the real routing and view
    function, in-process, and return a real response.
  - *Depends on:* A real, built `Flask` app.
  - *Connects to:* Called twice in this lesson's test, once per path,
    against the one app both requests share.
  - *Shape:* A testing seam Flask itself provides — the boundary between
    "test code" and "the real application code," deliberately thin so a
    passing test says something true about the real app.

## Concept Unit: Extracting the Shared Truth

### The Problem

The characterization work already done proved, with a real passing
test, that `/api/health` and `/health` currently disagree — different
`status` wording, one has a `version` field, one doesn't. Simply
deleting one of the two routes would silently break whatever, outside
this codebase, currently calls the one removed — a load balancer, a
monitoring tool, anything this investigation hasn't inspected. Before
reading on: if you can't delete either door, and you don't want the two
answers to ever drift apart again, what's the smallest change that
guarantees they can't?

### Project Change

- **Reference Source:** No reference counterpart in the legacy app for
  this specific file — `rebuild/rebuild_app/` is a new, from-scratch
  application factory, the first piece of the rebuild. Its shape is
  modeled on the legacy factory's own pattern
  (`backend/app/__init__.py:172`'s `create_app`), not copied from it.
- **Files affected:** `rebuild/rebuild_app/__init__.py`,
  `rebuild/rebuild_app/routes/__init__.py` (empty, marks the directory
  as a real Python package), and `rebuild/rebuild_app/routes/health.py`
  — all created.
- **Change type:** Add (an entirely new application).
- **Location:** New files; nothing existing to place them relative to.
- **Dependencies:** Flask (already installed in `backend/.venv`, reused
  here rather than installing a second copy).

### The New Code

New code, typed into a new file, `rebuild/rebuild_app/routes/health.py`:

```python
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)


def _health_payload():
    return {
        'status': 'online',
        'message': 'Manufacturing Data Platform Backend is ready.',
        'version': '1.0.0',
    }
```

### The Updated Project

**File:** `rebuild/rebuild_app/routes/health.py` — the file just started
in the step above (which only had `_health_payload()`); both real
routes below are new, typed in now, marked below, each calling that
same shared helper:

```python
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)


def _health_payload():
    return {
        'status': 'online',
        'message': 'Manufacturing Data Platform Backend is ready.',
        'version': '1.0.0',
    }


@health_bp.route('/health', methods=['GET'])                     # ← new
def health_check():                                                # ← new
    return jsonify(_health_payload())                              # ← new


@health_bp.route('/api/health', methods=['GET'])                  # ← new
def health_check_api():                                            # ← new
    return jsonify(_health_payload())                              # ← new
```

**File:** `rebuild/rebuild_app/__init__.py` (new — the application
factory that registers the blueprint above):

```python
from flask import Flask


def create_app():
    app = Flask(__name__)

    from rebuild_app.routes.health import health_bp
    app.register_blueprint(health_bp)

    return app
```

### Mechanical Walkthrough

- `def _health_payload(): return {...}` — a plain function, leading
  underscore by convention meaning "internal to this module, not part
  of any route's own public interface." This is the **Extract
  Function** (Terms, above) applied for real: the one dictionary both
  routes need now exists in exactly one place.
- `health_bp = Blueprint('health', __name__)` — the same blueprint
  construction already covered in full above, once, for this one file.
- `@health_bp.route('/health', methods=['GET']) def health_check():
  return jsonify(_health_payload())` — the first door. Its entire body
  is one call to the shared helper, wrapped in `jsonify`. It cannot
  independently drift from the second door, below, because it has no
  independent content left to drift.
- `@health_bp.route('/api/health', methods=['GET']) def
  health_check_api():` — the second door, a different Python function
  (a different name is required — Python doesn't allow two functions
  with the same name in one module, the same rule that let the legacy
  app's own bug happen unnoticed via `def health_check():` being quietly
  redefined) but calling the exact same shared helper, guaranteeing an
  identical body.
- `def create_app(): app = Flask(__name__); from
  rebuild_app.routes.health import health_bp;
  app.register_blueprint(health_bp); return app` — builds one real app,
  registers the one blueprint above (with no `url_prefix`, since both
  full paths are already spelled out on the blueprint itself), and
  returns it — the smallest possible real, working application factory.

### CS Lens

This is a real application of the **Don't Repeat Yourself (DRY)**
principle: the same real fact ("here's how this app reports it's
alive") now has exactly one place it's written down, with every
consumer of that fact (both routes) reading from that one place instead
of holding an independent copy. Also recognized in: a spreadsheet using
one named cell referenced by many formulas instead of retyping the same
number in each one; a build system reading one version number from one
file instead of a version string copy-pasted into several; a database
using a foreign key to reference one real row instead of duplicating
that row's data everywhere it's needed.

### SE Lens

The real alternative not chosen: deleting one of the two routes outright
and calling it done. That alternative is genuinely simpler code, and
genuinely riskier — nothing in this investigation confirmed whether
anything outside this codebase depends on the specific URL being
removed. The real, honest cost of the choice actually made here: two
URLs still exist for what is, underneath, one real feature — a small,
permanent bit of surface area a future reader has to notice and
understand, in exchange for not silently breaking an external caller
this codebase can't see. The one thing this lesson does deliberately
change, and does not merely refactor around: `/health`'s own response
body. That specific change is a real, external-behavior change, made
because the two prior behaviors already disagreed with each other —
there was no version of "keep both exactly as they were" that also
fixed the bug.

### Commands needed

- `pytest <path> -v -s` — runs every test function `pytest` finds under
  the given path. `-v` ("verbose") prints each test's own name and
  pass/fail result individually. `-s` disables pytest's default
  capturing of `print()` output, so this lesson's own `print` lines
  reach the real terminal. Success here looks like both real tests
  passing, one per real URL.

### Verification

Real output from actually running this lesson's test against the real,
new rebuild app:

```
test_rebuild_health.py::test_api_health_route
GET /api/health -> 200 {'message': 'Manufacturing Data Platform Backend is ready.', 'status': 'online', 'version': '1.0.0'}
PASSED
test_rebuild_health.py::test_bare_health_route_now_matches_api_health
GET /health -> 200 {'message': 'Manufacturing Data Platform Backend is ready.', 'status': 'online', 'version': '1.0.0'}
PASSED

2 passed in 0.11s
```

Both real URLs, both now returning the identical body — proof, not
assertion, that the two doors now share one room. Full saved run:
`verification/lesson-02/real_run_output.txt`.

### Connection to the previous unit

There is no previous unit — this lesson has exactly one.

## Connect the pieces

The real, previously-characterized bug: `/api/health` and `/health`
disagreeing on `status` wording and on whether `version` exists at all.
This lesson's real fix: one shared function, `_health_payload()`,
called by two separately-named route handlers, registered on one
blueprint, assembled by one new application factory — proven, by a real
test hitting both real URLs, to now return byte-for-byte identical
bodies. The old `/health` shape is gone on purpose, not by accident;
the old `/api/health` shape survives unchanged, becoming the one real
answer both doors now give.

**Next lesson:** whatever real feature `BACKEND-INVESTIGATION.md`'s
findings call for next in the rebuild sequence.
