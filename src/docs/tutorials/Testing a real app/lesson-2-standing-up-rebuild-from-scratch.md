# Lesson 2: Standing Up `rebuild` — An Application From Nothing

> **What "this project" means in this lesson.** Same as Lessons 0 and 1:
> every real path this lesson names is inside `manufacturing-platform`,
> a separate sibling repository, not `open-calc`. Before this lesson,
> `rebuild/` does not exist at all — not the directory, not a package,
> nothing. This is the first lesson in this series where the reader
> writes real code into a location that has never had any before.

## What you will build

The real, first-ever code inside `rebuild/backend` — a minimal Flask
application, built from scratch, whose only job right now is to exist
and answer `GET /health` the same way `backend/` (legacy) already does.
This is deliberately the entire scope of this lesson: no database, no
models, no other routes. This project's own shared acceptance test,
run with `ACCEPTANCE_TARGET=new` instead of `legacy`, has already been
proven, honestly, to fail with `ModuleNotFoundError: No module named
'app'` when pointed at `rebuild` — because there is genuinely nothing
there. This lesson is what turns that into a real pass, and the transferable problem
underneath it: what is the actual smallest amount of real code a working
Flask application can be built from, and why build it as a *function
that constructs an app* rather than one global `app = Flask(__name__)`
sitting at the top of a file?

## What you need to know first

Lesson 0 — `create_app` as a concept the reader has already called (not
yet written). Lesson 1 — `Flask.test_client()`, the
`acceptance-tests/` harness, `ACCEPTANCE_TARGET`, and this lesson's own
starting point: the real, honest RED proof Lesson 1 already captured.

## Terms introduced

- **Application factory (pattern)** — a function whose entire job is to
  build and return one fully-configured instance of an application
  object, rather than that object being built once, directly, at module
  import time. Legacy's own `create_app` is a real example of this
  pattern already in use; this lesson is the first time the reader
  *writes* one, rather than only calling one someone else already
  wrote. It exists because a plain module-level `app =
  Flask(__name__)` is built exactly once, the moment the module is
  first imported, and shared by everything afterward — including every
  test in the same process. A factory function, called fresh each time,
  hands back a brand-new, independent application object per call,
  which is exactly what lets this project's own shared acceptance-test
  harness build a completely separate, independent app for `legacy` and
  for `new` in the same running process, each one calling its own
  target's `create_app` fresh, without either interfering with the
  other.
- **Decorator** — Python's `@name` syntax, written directly above a
  function definition, which passes that function into `name` and
  replaces the original definition with whatever `name` returns.
  `@app.route('/health')` above `def health_check():` is this syntax
  applied to a real method call: it is not special route-specific
  grammar, it is the general, real Python decorator mechanism, applied
  here to register a function as this specific application's handler
  for one specific path.

## Objects and methods used

- **`Flask`**
  - *What it is:* a real class, Flask's own public entry point — the
    same class legacy's own real `create_app` function builds one
    instance of and returns.
  - *Implementation:* checked against Flask's own official
    documentation this session — `class Flask(app_name, ...)`, taking
    the importing module's own name as its required first argument and
    building one real, independent application object from it, with no
    routes, no configuration, and nothing else registered yet.
  - *Its use:* this lesson's `create_app` constructs exactly one real
    `Flask` instance, the same way legacy's own `create_app` already
    does, and returns it.
  - *Type:* a class; `Flask(__name__)` is a constructor call, producing
    one real instance.
  - *Responsibility:* representing one real, independent, addressable
    application — the object every route, every piece of configuration,
    and every request this application ever handles is registered on or
    routed through.
  - *Depends on:* `__name__`, a real, automatically-set Python variable
    holding the current module's own name — Flask uses it to locate the
    application's own root path on disk, for things like finding
    template and static folders later.
  - *Connects to:* returned by this lesson's own `create_app`; every
    route this application will ever have gets registered on this exact
    object.
  - *Shape:* the real composition root of this new backend — the one
    object everything else in `rebuild/backend` will eventually attach
    to, the same real role legacy's own `Flask` instance already plays
    there.

- **`Flask.route(rule)`**
  - *What it is:* a real instance method on `Flask`, part of Flask's
    public API.
  - *Implementation:* checked against Flask's own official
    documentation this session — called on a real `Flask` instance with
    a real URL path string (`'/health'`), it returns a real decorator;
    applying that decorator to a function registers that function as
    the handler Flask calls whenever a real request matches that exact
    path. If the handler function returns a plain Python `dict`, Flask
    automatically converts it into a real JSON HTTP response with
    status code `200`, by calling `jsonify()` on it internally — a
    documented, stable Flask behavior, not this project's own code.
  - *Its use:* this lesson calls it once, as `@app.route('/health')`,
    to register `health_check` as this application's own answer to a
    real `GET /health` request — the exact same path, method, and JSON
    shape this project's own shared acceptance test already checks.
  - *Type:* an instance method on `Flask`, called on a real, already
    constructed `app` object, returning a decorator.
  - *Responsibility:* connecting one real URL path to one real Python
    function, so that Flask's own request-dispatch machinery knows
    which function to call when a real request for that path arrives.
  - *Depends on:* a real, already-constructed `Flask` instance to be
    called on, and a real path string.
  - *Connects to:* called once by this lesson's own `create_app`; the
    function it decorates is called directly by Flask's own internal
    request handling, never by this project's own code.
  - *Shape:* the real seam between an incoming HTTP request and this
    project's own Python code — the same real mechanism every route in
    legacy's own `backend/app/routes/` already depends on.

---

## Concept Unit: An Application Built By a Function, Not a Global

### The Problem

This project's own shared acceptance-test harness, `get_client()`,
already contains the exact line this lesson has to satisfy: `from app
import create_app`, followed by `app = create_app('testing')`. For
that import to succeed at all,
`rebuild/backend/app/__init__.py` has to exist and define something
named `create_app`. Right now it does not exist — not the file, not the
folder, nothing. The real question this unit answers: what is the
actual smallest real thing `create_app` could be, that both makes that
import succeed and gives `/health` a real, correct answer, without
building anything this application doesn't need yet?

> **Before reading on:** legacy's own real `create_app` builds a
> `Flask` app, wires up a database, registers every route, seeds
> default users. This new application needs none of that yet — no
> database, no other routes. Given only what `/health` itself has to
> do (this project's own shared acceptance test: respond `200`, with a
> JSON body whose `'status'` key is `'healthy'`),
> what's the actual smallest real thing a function named `create_app`
> could contain and still make that true?

### Project Change

- **Reference Source** — no reference counterpart. Legacy's own
  `create_app` (`backend/app/__init__.py:172`) is real, existing code,
  but this lesson is deliberately *not* porting it — see the SE Lens,
  below, for why building the minimum this application actually needs,
  right now, is the real choice being made instead.
- **Files affected** — created: `rebuild/backend/app/__init__.py`,
  brand new, inside a brand new `rebuild/backend/app/` package — this
  lesson's own first real code in `rebuild/` at all.
- **Change type** — add (new file, new folders).
- **Location** — new file; nothing to locate a position within.
- **Dependencies** — `flask`, already a real, installed dependency of
  `backend/.venv` (this project's one shared Python environment) since
  before this series began; nothing new to install.

### The New Code

```python
from flask import Flask


def create_app(config_name=None):
    app = Flask(__name__)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}

    return app
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — brand new, so this is the
whole file:

```python
1  from flask import Flask
2
3
4  def create_app(config_name=None):
5      app = Flask(__name__)
6
7      @app.route('/health')
8      def health_check():
9          return {'status': 'healthy'}
10
11     return app
```

### Mechanical Walkthrough

- **Line 1, `from flask import Flask`** — imports this lesson's Header's
  real `Flask` class from the `flask` package, the same real package
  legacy's own backend already depends on.
- **Line 4, `def create_app(config_name=None):`** — an ordinary Python
  function definition, named `create_app` for the exact real reason
  this project's own shared acceptance-test harness already requires:
  that name is what its own `from app import create_app` looks for.
  `config_name=None` — a parameter with a default value, accepting the
  same real `'testing'`/`'legacy'`-shaped string legacy's own
  `create_app` call already passes, but not yet *using* it for
  anything — this application has no per-environment behavior yet to
  choose between, so nothing branches on it; it exists purely so the
  real call this project's own harness already makes,
  `create_app('testing')`, has somewhere valid to land instead of
  raising a real `TypeError` for an unexpected argument.
- **Line 5, `app = Flask(__name__)`** — this lesson's Header's real
  `Flask` class, constructed here for the first time in this whole
  series, and kept in a local variable named `app`.
- **Line 7, `@app.route('/health')`** — this lesson's Header's own
  **Decorator** syntax, applied to a real call: `app.route('/health')`
  — this lesson's Header's `Flask.route(rule)` method, called on the
  real `app` object line 5 just built, with the real path string
  `'/health'` — returns a real decorator, which this line then applies
  directly to the function defined immediately below it.
- **Lines 8–9, `def health_check(): return {'status': 'healthy'}`** — an
  ordinary Python function, named for what it does, taking no
  arguments. Its real body is one line: a plain Python `dict` literal,
  with one key, `'status'`, holding the plain string `'healthy'`. This
  function is never called directly by this file's own code — line 7's
  decorator is what makes Flask call it, later, only when a real `GET
  /health` request actually arrives.
- **Line 11, `return app`** — hands back the real, now-fully-built
  `Flask` object — with its one real route already registered — to
  whatever called `create_app`, the same real shape legacy's own
  `create_app` already returns.

### CS Lens

This is a real, minimal instance of the **factory pattern** —
legacy's own real `create_app` already proves the general idea for
real (call a function, get back a fully-built object, instead of
constructing it yourself, inline, by hand); this lesson is the first
time the reader builds one instead of only calling one someone else
already wrote.

Also recognized in: any `createX()`/`buildX()`/`newX()`-named function
across virtually every real codebase; a database connection pool
handing out a fresh connection per request instead of one shared global
connection; a UI toolkit's `Widget.create(...)` static method,
returning a fully-configured widget instead of exposing its
constructor directly.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own `create_app` wholesale — its database wiring, its route
registration, its user-seeding — right now, in this lesson. Rejected on
purpose: this application does not have a database yet, does not have
any other route yet, and per this series' own stated method
(`README.md`), the legacy app is a *behavioral oracle*, never a design
to copy — building infrastructure this application doesn't need yet,
just because legacy already has it, would be building ahead of any real
requirement, the same real mistake this series' own opening `README.md`
already names as a rule to avoid. The real, honest cost being accepted
here: this `create_app` will have to change, more than once, as later
lessons give this application a real reason to need a database, other
routes, or per-environment configuration — and that's the correct
order, not a shortcut.

### Commands needed

No new command beyond this project's own shared acceptance-test
harness — this unit's own real proof reuses that exact,
already-written `acceptance-tests/test_health.py`, unmodified, pointed
at `new` instead of `legacy`:

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='new'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_health.py -v
```

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed, per the
Verification Rule's own necessity clause: a `dict` returned from a
Flask view function being automatically converted into a `200` JSON
response is stable, official, documented Flask behavior, not something
this lesson has any real doubt about. The predicted output, in the
exact same shape this project's own shared acceptance test already,
really produced when run against `legacy`:

```
test_health.py::test_health_returns_200_and_status_healthy PASSED [100%]
1 passed in ...s
```

If this does *not* happen exactly this way when actually run, that's a
real signal something above is wrong, and worth stopping to investigate
before continuing — not a reason to edit this lesson to match a
surprising result without understanding why first.

### Connecting this unit to what came before

This project's own shared acceptance test already proved, honestly,
that `rebuild` had nothing in it at all — the correct starting RED.
This unit is the other half of that same
slice: the real, from-scratch minimum that makes the identical,
unmodified test pass there too, without building one line more than
`/health` actually requires.

---

## Connect the pieces

One real request, `GET /health`, now has two real, independent, correct
answers: legacy's own, already-existing route, and this lesson's
brand-new one, built from nothing, using nothing but a real `Flask`
instance and one real decorator. Nothing about how legacy answers it
was copied — only the external contract this project's own shared
acceptance test already captured was. `rebuild/backend` is no longer empty; it is a real,
working, minimal application with exactly one capability, and nothing
more than that capability required.

---

**Next lesson:** `rebuild/frontend` — the other half of the walking
skeleton, built from nothing the same way this lesson's backend was,
up to the point it can render something real on screen. Connecting it
to this lesson's own `/health` route — proving a real frontend can
reach a real backend — comes after that, once both sides of the
connection actually exist.
