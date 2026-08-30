# Lesson 1: Mapping a URL to a Function

*All file paths in this lesson (`backend/...`, `verification/...`) refer
to the `manufacturing-platform` repository — the real app this
curriculum is built from.*

**What you will build:** A real, passing test that proves exactly what
the legacy backend's two health-check endpoints actually return today —
not what they're supposed to return, what they *really* return, verified
by actually calling them. The transferable problem underneath it: how a
web framework decides which Python function to run when a request for a
specific URL and method arrives, and what happens when a team builds two
different functions to answer what is effectively the same question.

**What you need to know first:** Nothing. This is Lesson 1.

**Pipeline diagram:** Not applicable — no multi-stage pipeline has been
established yet in this curriculum.

## Terms used in this lesson

- **HTTP request** — a structured message a client (a browser, a test,
  `curl`, another program) sends to a server asking it to do something.
  It exists because client and server are separate programs, often on
  separate machines, with no shared memory — a request is the only way
  one can ask the other for anything at all.
- **HTTP method** — a word at the start of a request (`GET`, `POST`,
  etc.) declaring the *kind* of thing being asked for. It exists so a
  server (and everything sitting between client and server — caches,
  proxies, browsers) can tell "just show me something" apart from
  "change something," without having to inspect what the request
  actually does.
- **GET** — the specific HTTP method used in this lesson's code. It
  declares "read-only, no side effect expected" — safe to retry, safe to
  cache, safe for a monitoring tool to call every few seconds forever,
  which is exactly the situation a health check lives in.
- **URL path** — the part of a request naming *which* resource is being
  asked about (`/health`, `/api/health`). It exists so one server can
  answer many different questions instead of needing a separate address
  for each one.
- **HTTP status code** — a three-digit number in every HTTP response
  stating the outcome of the request, before a program even looks at the
  body. `200` means "succeeded, here's the result." It exists so success
  and failure can be told apart mechanically, by every layer in between,
  without parsing a message meant for humans.
- **JSON (JavaScript Object Notation)** — a plain-text format for
  structured data: `{"key": "value"}`. It exists as a format both a
  browser's JavaScript and a Python backend can read and write natively,
  without either side needing to know what language the other is
  written in.
- **Route / routing** — the act of a web framework matching an incoming
  request's method and path against a table of registered handlers, and
  calling the one that matches. It exists because a server doesn't
  naturally know "a GET to `/health`" means "call `health_check`" — that
  mapping has to be built and stored somewhere, and routing is the name
  for the mechanism that stores and checks it.
- **Decorator** (`@something`) — Python syntax that wraps a function in
  another piece of behavior without changing the function's own body.
  `@health_bp.route(...)` exists so "register this function as a route
  handler" can be stated once, directly above the function it applies
  to, instead of writing a separate registration call somewhere else in
  the file.
- **`__name__`** — a variable Python automatically creates inside every
  module, holding that module's own name as a string. Flask's
  `Blueprint` constructor uses it to work out which package a
  blueprint's resources (templates, static files) belong to; it exists
  so Flask doesn't have to guess.
- **URL prefix** — a path segment a framework prepends to every route
  registered under a given blueprint. It exists so a group of related
  routes can all live under one namespace (`/api/...`) by stating that
  namespace exactly once, at registration, rather than repeating it in
  every route's own path string.

## Objects and methods used

- **`Blueprint`**
  - *What it is:* A Flask class representing a named, separately-defined
    group of routes that gets registered into a real app later, instead
    of being attached to one directly.
  - *Implementation:* `flask.Blueprint(name: str, import_name: str, ...)`
    — takes a name used internally by Flask to identify the blueprint,
    and an import name (conventionally `__name__`) used to locate the
    blueprint's own resources.
  - *Its use:* `health.py` builds one (`health_bp`) so the health-check
    route can be defined in its own file and wired into the real app
    without that file needing to import or construct the whole `Flask`
    app itself.
  - *Type:* A class, instantiated once at module load time.
  - *Responsibility:* Hold a set of routes and their handler functions
    in one place, independent of any specific running app, until
    something later attaches that whole set to a real app at once.
  - *Depends on:* A name and an `import_name` at construction; nothing
    else until registration.
  - *Connects to:* `health.py` constructs it; `@health_bp.route(...)`
    adds routes to it; `app.register_blueprint(health_bp, ...)` in
    `backend/app/routes/__init__.py:16` is what actually wires its
    routes into a real, running `Flask` app.
  - *Shape:* A public, framework-provided seam between "a group of
    related routes" and "the one running application" — it's what lets
    `health.py` exist as its own file at all.

- **`Blueprint.route`**
  - *What it is:* A method on `Blueprint` that both registers a URL
    rule and returns a decorator to attach to the function that should
    handle it.
  - *Implementation:* `route(rule: str, methods: list[str] = ["GET"],
    **options)` — called as `@health_bp.route("/health",
    methods=["GET"])` directly above `health_check`.
  - *Its use:* This is the actual mechanism that turns a plain Python
    function into something reachable over HTTP at all.
  - *Type:* An instance method, used here through decorator syntax
    rather than a direct call.
  - *Responsibility:* Record "this rule, these methods, call this
    function" against the blueprint it was called on.
  - *Depends on:* A path string, an explicit or default method list, and
    the function it decorates.
  - *Connects to:* Called by `health.py`'s own module-level code at
    import time; consulted by Flask itself on every incoming request, to
    decide whether `health_check` is the function to run.
  - *Shape:* The public entry point of Flask's routing system — the one
    line of code that turns "a function" into "an endpoint."

- **`jsonify`**
  - *What it is:* A Flask function that converts a Python value (here, a
    `dict`) into a real HTTP response carrying JSON text and the correct
    `Content-Type` header.
  - *Implementation:* `flask.jsonify(*args, **kwargs) -> Response` —
    called here as `jsonify({...})` with one `dict` argument.
  - *Its use:* `health_check` returns its result through `jsonify` so
    the response is a real, correctly-labeled JSON document instead of
    a plain Python `dict` (which has no meaning to an HTTP client at
    all).
  - *Type:* A free function (not a method on any class).
  - *Responsibility:* Serialize the given value to a JSON string, wrap
    it in a `Response` object, and set that response's `Content-Type`
    header to `application/json` — all three, not just the text
    conversion.
  - *Depends on:* A JSON-serializable Python value (here, a `dict` of
    strings).
  - *Connects to:* Called inside `health_check`; its returned `Response`
    is what Flask ultimately sends back over the real HTTP connection to
    whatever client made the request.
  - *Shape:* The seam between "a Python value" and "a real, spec-shaped
    HTTP response" — this is what a route handler is expected to return.

- **`Flask`**
  - *What it is:* The class at the center of the framework — an instance
    of it represents one real, running (or testable) web application.
  - *Implementation:* `flask.Flask(import_name: str)` — constructed once,
    normally inside a factory function.
  - *Its use:* The isolated lab builds one directly (`Flask(__name__)`)
    to have something real to register the lab blueprint into; the real
    app builds one indirectly, inside `create_app` (below).
  - *Type:* A class.
  - *Responsibility:* Hold the app's whole configuration and its entire
    real routing table — every blueprint and every directly-registered
    route, combined into one structure a real request can be matched
    against.
  - *Depends on:* An `import_name`, conventionally `__name__`, so Flask
    can locate the application's own files.
  - *Connects to:* Blueprints (via `register_blueprint`, next entry)
    attach their routes to it; `app.test_client()` builds a testing
    handle onto it; a real deployment runs it directly.
  - *Shape:* The outermost public seam of the whole framework — every
    other Flask object shown in this lesson exists to be attached to, or
    called through, one of these.

- **`Flask.register_blueprint`**
  - *What it is:* An instance method that copies a `Blueprint`'s own
    recorded routes into a real `Flask` app's routing table.
  - *Implementation:* `register_blueprint(blueprint: Blueprint, url_prefix:
    str = None)` — called in this lesson as
    `app.register_blueprint(health_bp, url_prefix='/api')`.
  - *Its use:* This is the one call that turns `health_bp` (built in
    `health.py`, entirely separate from any running app) into something
    a real, running app actually answers requests through.
  - *Type:* An instance method on `Flask`.
  - *Responsibility:* For every route the given blueprint recorded,
    register the same method-and-path mapping on the real app, with the
    given `url_prefix` joined onto the front of each path.
  - *Depends on:* A `Blueprint` object that already has its own routes
    recorded (via `@health_bp.route(...)`, already explained above).
  - *Connects to:* Called once, inside `create_app` (below), for every
    blueprint the real app has; after this call returns, the real app's
    routing table includes everything the blueprint recorded.
  - *Shape:* The seam between "a blueprint, defined in its own file" and
    "a real app that actually answers requests" — this is where the two
    become one.

- **`create_app`**
  - *What it is:* The real project's own application factory — an
    ordinary Python function, not something Flask provides, that builds
    and fully configures one real `Flask` app and returns it.
  - *Implementation:* `create_app(config_name: str = None) -> Flask`,
    defined at `backend/app/__init__.py:172`.
  - *Its use:* This lesson's test calls `create_app("testing")` to get a
    real app instance — the exact same kind a real deployment would run,
    just configured with an in-memory database instead of the real,
    persistent one.
  - *Type:* A free function (module-level, not a method on any class).
  - *Responsibility:* Build one `Flask` instance, load the right
    configuration for the given name (`backend/config.py`'s `config`
    dict), register every real blueprint (including `health_bp`), and
    return the fully-assembled app — one function responsible for
    everything that has to happen before the app can answer a single
    real request.
  - *Depends on:* A config name (`"testing"`, `"development"`,
    `"production"`, or `None` for the default), used to select which
    configuration class from `backend/config.py` to apply.
  - *Connects to:* Called by this lesson's test; also called by
    whatever real entry point starts the actual deployed server. Both
    paths run through the exact same function.
  - *Shape:* The single, real starting point for the entire application
    — everything else in this lesson (`health_bp`, its registration, the
    running app the test calls into) exists because this one function
    assembled it.

- **`FlaskClient.get`** (from `app.test_client()`)
  - *What it is:* A method that simulates a real HTTP GET request
    against a Flask app, in-process, without opening an actual network
    socket.
  - *Implementation:* `FlaskClient.get(path: str) -> Response` — called
    in this lesson's test as `client.get("/api/health")`.
  - *Its use:* This lesson's test uses it to make a real call into the
    real app and get back a real `Response`, which is what makes the
    test a characterization of actual behavior rather than a guess.
  - *Type:* An instance method on the `FlaskClient` object Flask returns
    from `app.test_client()`.
  - *Responsibility:* Build a request matching the given path and
    method, run it through the exact same routing and view-function code
    a real deployed server would use, and return the exact same kind of
    `Response` object a real client would receive.
  - *Depends on:* A running, configured `Flask` app instance (built here
    via `create_app("testing")`) to call `test_client()` on.
  - *Connects to:* Called by this lesson's test function; internally
    calls the exact same routed view functions (`health_check` in both
    `health.py` and `app/__init__.py`) that a real deployed server would
    call for the same request.
  - *Shape:* A testing seam Flask itself provides — the boundary between
    "test code" and "the real application code," deliberately left thin
    so a passing test says something true about the real app.

- **`response.get_json()` / `response.status_code`**
  - *What it is:* Two related members of the same real response object —
    `get_json()` parses the response body back into a Python value;
    `status_code` reads the response's real HTTP status code.
  - *Implementation:* Both are inherited, not defined by Flask itself.
    The real object `client.get(...)` returns is a
    `werkzeug.test.WrapperTestResponse`, which is (in real inheritance
    order) `TestResponse → flask.wrappers.Response →
    werkzeug.wrappers.response.Response → werkzeug.sansio.response.Response`.
    Their real declared shapes, fetched from the installed
    `werkzeug` package this session:

    ```python
    # werkzeug/sansio/response.py
    @property
    def status_code(self) -> int:
        """The HTTP status code as a number."""
        return self._status_code

    # werkzeug/wrappers/response.py
    def get_json(self, force: bool = False, silent: bool = False) -> t.Any | None:
        """Parse `data` as JSON. Useful during testing.

        If the mimetype does not indicate JSON, this returns None.
        """
    ```

    `status_code` is a real `@property` (an instance attribute computed
    by a method, not stored directly) backed by `self._status_code`.
    `get_json` takes two real optional arguments this lesson doesn't
    use — `force` (parse as JSON even if the `Content-Type` header
    doesn't say so) and `silent` (return `None` instead of raising on
    malformed JSON) — both left at their defaults here because
    `jsonify` (already covered above) always sets the correct
    `Content-Type`, so neither override is needed.
  - *Its use:* This lesson's test reads both to state, precisely, what
    each real endpoint actually returned — not what its source code
    looks like it should return.
  - *Type:* `get_json` is a real instance method; `status_code` is a
    real instance property (not a plain stored attribute).
  - *Responsibility:* `get_json` decodes the response body's raw JSON
    text back into a native Python value for the test to compare against
    a real expected value; `status_code` exposes the numeric outcome the
    server actually sent.
  - *Depends on:* A real response object already returned by a call
    such as `client.get(...)`.
  - *Connects to:* Both are read directly by this lesson's test
    assertions, immediately after `client.get(...)` returns.
  - *Shape:* The read side of the same test-client seam described above
    — where a test actually inspects what came back.

## Concept Unit: Routing — Mapping an HTTP Request to a Function

### The Problem

A running Flask process is one program. A `curl` command, a browser, or
this lesson's own test is a separate program entirely, possibly on a
different machine. When that separate program sends "`GET /api/health`"
over the network, *something* inside the Flask process has to decide
which of potentially hundreds of Python functions should run, and pass
that function whatever it needs to build a response — with nothing
resembling a normal Python function call anywhere in sight, because
there's no call site: nobody in the codebase writes `health_check()`
directly.

Before reading on: if you had to build this mapping yourself, with
nothing but a dictionary and a Python function you already know how to
write, what would you store as the dictionary's key? What would stop two
different files in the same project from accidentally choosing the same
key?

### Project Change

- **Reference Source:** `backend/app/routes/health.py:1-12`, quoted
  verbatim below; registered into the real running app at
  `backend/app/routes/__init__.py:15-16`.
- **Files affected:** None. This unit is read-only — it explains code
  that already exists in the legacy app; nothing is being modified yet.
- **Change type:** None (characterization/explanation only).
- **Location:** N/A — no new code is being placed anywhere in this unit.
- **Dependencies:** A Flask app built through the real `create_app`
  factory (`backend/app/__init__.py:172`), so the blueprint has
  something real to be registered into.

### The New Code

This first code block is a lab you type and run yourself, anywhere
scratch (a new, temporary file of your own — it is not part of your
real project and never will be). It exists only to isolate the
mechanism, before you look at the real, already-existing health check
sitting in your actual app:

```python
from flask import Blueprint, Flask, jsonify

lab_bp = Blueprint("lab", __name__)

@lab_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"pong": True})

app = Flask(__name__)
app.register_blueprint(lab_bp, url_prefix="/lab")

client = app.test_client()
response = client.get("/lab/ping")
print("status_code:", response.status_code)
print("get_json():", response.get_json())
print("content_type:", response.content_type)
```

### The Updated Project

This lab has no existing project file to fold into — it's a complete
script, short enough to run start-to-finish on its own, with nothing
else around it. Running it (see Verification, below) is what actually
answers the Problem's question: Flask's own answer to "what's the
dictionary key" is **method plus path together**, not path alone —
which is exactly why `methods=["GET"]` appears explicitly in the
decorator instead of being implied.

The next two code blocks are different in kind from the lab above: both
are real code that already exists in your actual app, right now. Don't
type either of them — open the real files and read them.

**File:** `backend/app/routes/health.py` (already exists — read-only,
nothing to type):

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

That's the entire file — 12 lines, nothing omitted.

**File:** `backend/app/routes/__init__.py` (already exists — read-only;
the two lines below are quoted out of the middle of a longer file, so
they're shown without line numbers to avoid implying they're the whole
file or that they start at its beginning):

```python
from app.routes.health import health_bp
app.register_blueprint(health_bp, url_prefix='/api')
```

The `register_blueprint` call's `url_prefix='/api'` is why a request has
to say `GET /api/health`, not `GET /health`, to reach this particular
function — Flask joins the prefix and the route's own path (`/health`,
from the `@health_bp.route(...)` call above) together at registration
time.

### Mechanical Walkthrough

Enumerating every element of the real file, in order:

- `from flask import Blueprint, jsonify` — a Python module import,
  bringing two names, `Blueprint` and `jsonify`, from the installed
  `flask` package into this file's own namespace. Nothing runs yet;
  this only makes the names available.
- `health_bp = Blueprint('health', __name__)` — calls the `Blueprint`
  constructor (full treatment above) with two positional arguments: the
  string `'health'` (an internal identifying name Flask uses for this
  blueprint, unrelated to any URL) and `__name__` (this module's own
  name, per the Terms entry above, used so Flask can locate this
  blueprint's own resources if it ever needs to). The result is assigned
  to the module-level variable `health_bp`.
- `@health_bp.route('/health', methods=['GET'])` — a decorator (per the
  Terms entry above) built from a call to `Blueprint.route` (full
  treatment above) on the `health_bp` object just created. `'/health'`
  is the URL path this route answers to, relative to whatever prefix
  it's registered under later. `methods=['GET']` is a keyword argument
  holding a one-element list, explicitly stating this route only
  answers `GET` requests — nothing else.
- `def health_check():` — an ordinary Python function definition, no
  parameters. The decorator above wraps this specific function as the
  handler for the route just described.
- `"""Basic health check to verify backend is running."""` — a
  docstring: a plain string literal, unused at runtime, documenting the
  function's purpose for a human reading the source.
- `return jsonify({...})` — calls `jsonify` (full treatment above) with
  one `dict` literal, and returns whatever it produces as this
  function's result. Because Flask's routing already knows this
  function is the handler for `GET /health` under this blueprint, this
  return value is exactly what gets sent back over the real network
  connection to whoever asked.
- `'status': 'online', 'message': '...', 'version': '1.0.0'` — three
  key/value pairs in the `dict` literal passed to `jsonify`, each a
  plain Python `str`. These become the real JSON body's three fields,
  with no transformation beyond `jsonify`'s own serialization.

### Execution Trace

This code has no loop, recursion, or state carried across steps — it's
a single straight-line call per request. A control-flow trace is more
useful here than a value trace, since the actual point is *when* Flask's
own routing machinery runs relative to this file's own code:

1. `health_bp = Blueprint('health', __name__)` — runs once, when
   `health.py` is first imported (triggered by
   `routes/__init__.py:15`'s `from app.routes.health import health_bp`).
   Only builds the blueprint object; calls no application code.
2. `@health_bp.route(...)` — also runs at import time, immediately after
   step 1. Records the mapping `("GET", "/health") → health_check` on
   `health_bp`. Still no HTTP request has happened; `health_check`
   itself has not been called.
3. `app.register_blueprint(health_bp, url_prefix='/api')`
   (`routes/__init__.py:16`) — runs once, during `create_app`. Copies
   `health_bp`'s recorded mapping into the real app's own routing table,
   with `/api` joined onto the front of every path. Still no request has
   happened.
4. A real `GET /api/health` request arrives (from a browser, `curl`, or
   this lesson's own test client). Only *now* does Flask itself look up
   `("GET", "/api/health")` in the table built in step 3, find
   `health_check`, and actually call it — the first moment any of this
   file's own logic runs in response to anything. (The name for
   "choosing which function to run based on data only available at run
   time," like Flask does right here, is **dispatch** — named and
   explained in the CS Lens, just below.)

Steps 1-3 happen once, at startup, regardless of whether any request
ever arrives. Step 4 is the only one that can happen zero, one, or a
million times, and it's the only one this file's author has no direct
control over the timing of — a real client, somewhere else, decides
when.

### CS Lens

This is **dispatch**: choosing which piece of code to run based on data
available only at run time (here, a request's method and path), rather
than at the point where the code is written. Also recognized in: a
`switch` statement choosing a branch on a runtime value, a GUI toolkit
calling whichever button's callback matches the click that just
happened, a CPU's own instruction decoder choosing a circuit path based
on the opcode bits it reads, and a compiler's parser choosing a grammar
rule based on the next token in the input stream.

### SE Lens

The routing table (steps 1-3 above) is built once, at startup, and
reused for every request afterward, instead of re-parsing "what handles
`/api/health`" from scratch on every single call. The alternative not
chosen — checking every registered function's own decorator by brute
force on every request — would work, but would make every single
request pay a cost that only ever needs to be paid once per process
lifetime. This is the same idea as caching a value computed from
something that doesn't change: pay once, reuse many times. The
maintenance cost this specific project is already carrying: nothing here
yet, but it sets up exactly the seam Concept Unit 2 uses to show a real
one.

### Commands needed

None yet in this unit — no terminal command was required to define or
register a route; that happens entirely from Python source already
being imported by the running app.

### Verification

Real output from actually running the isolated lab
(`verification/lesson-01/lab_blueprint_routing.py`):

```
status_code: 200
get_json(): {'pong': True}
content_type: application/json
```

This proves the lab's own route really was reachable under its `/lab`
prefix, really only answered `GET`, and really returned exactly the
`dict` given to `jsonify` — nothing added, nothing dropped, wrapped in a
response correctly labeled as JSON.

### Connection to the previous unit

There is no previous unit — this is the first one in the curriculum.

## Concept Unit: Characterizing Real Behavior With a Test

### The Problem

`health.py` isn't the only health check in this codebase.
`backend/app/__init__.py` registers a second one, directly on the `app`
object rather than through a blueprint. Two people, at two different
points in this project's history, apparently both decided the app
needed a way to answer "are you alive?" Before writing a single line of
rebuild code, this curriculum's own method (`MASTERCLASS-PLAN.md`)
requires knowing, for real, exactly what each one currently does — not
assuming they're identical because they sound like they should be.

Before reading on: given `Blueprint.route` and `jsonify` from the unit
above, what's the smallest possible test you could write to find out,
for certain, whether these two endpoints actually agree with each
other?

### Project Change

- **Reference Source:** `backend/app/__init__.py:424-439`, quoted
  verbatim below — the second, app-level health check; plus
  `backend/app/routes/health.py:1-12` again, already quoted in the unit
  above, as the point of comparison.
- **Files affected:** `verification/lesson-01/test_characterize_health.py`
  — created.
- **Change type:** Add (a new test file; no application code changes).
- **Location:** New file, `verification/lesson-01/`, this curriculum's
  own verification location for this unit's characterization work.
- **Dependencies:** `pytest`, and the real `create_app` factory, both
  already present in `backend/requirements.txt` and `backend/.venv`.

**File:** `backend/app/__init__.py` (already exists — read-only; this is
a real, currently-running route, not something to type). The snippet
below is quoted from the middle of a much longer file, shown without
its original line numbers for the same reason as the excerpt in the
unit above — a short, out-of-context excerpt isn't the start of the
file:

```python
@app.route('/health')
def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    """
    return {'status': 'healthy', 'message': 'Manufacturing Platform API is running'}
```

### The New Code

This is new code — you're about to type it into a brand-new file,
`verification/lesson-01/test_characterize_health.py`, which doesn't
exist yet:

```python
def test_blueprint_health_route():
    app = create_app("testing")
    client = app.test_client()

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json() == {
        "status": "online",
        "message": "Manufacturing Data Platform Backend is ready.",
        "version": "1.0.0",
    }
```

### The Updated Project

**File:** `verification/lesson-01/test_characterize_health.py` — new,
shown here in full, both real tests included (the fragment above is
just the first one, `test_blueprint_health_route`, seen alone before
its sibling test joins it):

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from app import create_app


def test_blueprint_health_route():
    app = create_app("testing")
    client = app.test_client()

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json() == {
        "status": "online",
        "message": "Manufacturing Data Platform Backend is ready.",
        "version": "1.0.0",
    }


def test_app_level_health_route():
    app = create_app("testing")
    client = app.test_client()

    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {
        "status": "healthy",
        "message": "Manufacturing Platform API is running",
    }
```

The file's first six lines exist so this file, sitting outside `backend/`, can import the
real `app` package as if it were running from inside `backend/` —
`sys.path.insert` adds `backend/`'s real filesystem location to the list
of directories Python searches for importable packages, computed
relative to this file's own location rather than hardcoded, so it keeps
working regardless of which directory a future `pytest` invocation is
run from.

### Mechanical Walkthrough

- `import sys` / `from pathlib import Path` — standard library imports,
  bringing in `sys` (for `sys.path`) and `Path` (an object representing
  a filesystem path).
- `Path(__file__)` — `__file__` is a variable Python sets automatically
  to this file's own path; wrapping it in `Path` gives an object with
  real path-manipulation methods instead of a plain string.
- `.resolve()` — a method on `Path` that converts a possibly-relative
  path into an absolute one, resolving any `..` segments for real
  against the actual filesystem.
- `.parents[2]` — a `Path` property giving this file's ancestor
  directories as a sequence; index `2` walks up two levels from this
  file (out of `lesson-01/`, out of `verification/`) to the project
  root, so `/ "backend"` can be appended to reach the real backend
  folder regardless of where the whole project happens to be checked
  out on disk.
- `sys.path.insert(0, ...)` — `sys.path` is the real, live list Python
  consults to find importable packages; `insert(0, ...)` puts this
  computed backend path at the very front, so `from app import
  create_app` (the next line) succeeds even though this test file lives
  outside `backend/` entirely.
- `from app import create_app` — imports the real application factory,
  the same one the actual running server uses, from `backend/app/`.
- `def test_blueprint_health_route():` — an ordinary function
  definition; `pytest` (already run in this lesson's Verification,
  below) automatically finds and runs any function in this file whose
  name starts with `test_`.
- `create_app("testing")` — calls the real factory with the string
  `"testing"`, which `backend/config.py:66-71`'s `config` dict maps to
  `TestingConfig` — an in-memory SQLite database, so this test never
  touches the real, persistent `manufacturing.db` file.
- `app.test_client()` (full treatment in the Header, above) — builds the
  in-process HTTP simulator used by both tests.
- `client.get("/api/health")` / `client.get("/health")` — each makes a
  real, in-process `GET` request against one of the two real,
  competing endpoints.
- `response.status_code` / `response.get_json()` (full treatment in the
  Header, above) — read the real numeric status and real decoded JSON
  body back from each response.
- `assert ... == {...}` — Python's `assert` statement: evaluates the
  expression, and if it's `False`, immediately stops the test and
  reports failure with the compared values. Here it's checking real
  equality between two Python `dict`s — every key and value must match
  exactly, in either order, since `dict` equality doesn't care about key
  order.

### CS Lens

This is a **characterization test** — a test written not to check
behavior against a specification, but to pin down and prove *actual,
current* behavior, bugs and inconsistencies included, as a stable
baseline to build against. Also recognized in: a snapshot test comparing
a UI's rendered output against a previously-saved copy, a golden-file
test in a compiler comparing generated assembly against a known-good
sample, and regression testing generally — proving "this still does
exactly what it did before," independent of whether "before" was ever
actually correct.

### SE Lens

**Don't Repeat Yourself (DRY):** the same knowledge — "here's how this
app reports that it's alive" — should exist in exactly one place, so
that fixing or changing it means changing one thing, not remembering to
find every place it was copied. This codebase currently violates it:
`health.py`'s blueprint and `app/__init__.py`'s direct route each encode
that same knowledge independently, and they've already drifted apart —
different `status` values (`"online"` vs. `"healthy"`), a `version` key
present in one and absent from the other. The alternative not chosen
here — and *not yet chosen by this lesson either*, on purpose — would be
deleting one of them right now. This lesson deliberately doesn't:
per `MASTERCLASS-PLAN.md`'s own method, the legacy behavior gets
characterized and explained *before* a rebuild lesson touches it, and
right now both endpoints are still real, live, and possibly depended
on by something outside this codebase (a load balancer, a monitoring
tool) that this investigation hasn't inspected yet. The honest
maintenance cost this project is already carrying: two sources of truth
for the same fact, silently free to disagree further with every future
change to either one, until a rebuild lesson deliberately picks one and
removes the other.

### Commands needed

- `pytest <path> -v -s` — runs every test function `pytest` finds under
  the given path. `-v` ("verbose") prints each test's own name and
  pass/fail result individually, instead of one summary character per
  test. `-s` disables pytest's default capturing of `print()` output, so
  anything a test prints reaches the real terminal instead of being
  hidden. Success looks like every listed test ending in `PASSED` and a
  final summary line reading `N passed`.

### Verification

Real output from actually running this test against the real,
unmodified legacy app:

```
test_characterize_health.py::test_blueprint_health_route
GET /api/health -> 200 {'message': 'Manufacturing Data Platform Backend is ready.', 'status': 'online', 'version': '1.0.0'}
PASSED
test_characterize_health.py::test_app_level_health_route
GET /health -> 200 {'message': 'Manufacturing Platform API is running', 'status': 'healthy'}
PASSED

2 passed, 10 warnings in 6.90s
```

Both pass — both real endpoints are alive, both really answer `200`, and
both really disagree about what `status` means and whether `version`
exists at all, exactly as predicted from reading the source in this
unit's Project Change, above. Full saved run:
`verification/lesson-01/real_run_output.txt` (in the
`manufacturing-platform` repository).

### Connection to the previous unit

The unit above explained how one function gets reached from one URL;
this unit used that same mechanism, twice, against two real,
independently-built endpoints, and proved — with a real, passing test
instead of a guess — exactly how far they've already drifted apart.

## Connect the pieces

One concrete request, traced through everything built in this lesson: a
real `GET /api/health` arrives → Flask's routing table (built once, at
startup, from `health_bp`'s registration under the `/api` prefix) maps
it to `health_check` in `health.py` → that function returns `jsonify({...
'status': 'online' ...})` → this lesson's own test (`client.get`) receives
that exact response, in-process, and asserts it matches, byte-for-byte,
what the real source predicted. The same request shape, sent instead to
`/health`, reaches a second, independently-built function and gets back
a *different* shape — `'status': 'healthy'`, no `version` — proving, with
a real passing test rather than an assumption, that this app currently
answers "are you alive?" two different ways depending on which door you
knock on.

**Next lesson:** Lesson 2 — rebuild this feature as one real
implementation that passes both of this lesson's assertions, and
explain why the duplication gets resolved the way it does.
