# Lesson 1.1: A Server That Answers

## What you will build

The first piece of the backend — a Flask process you can actually run
and reach over HTTP, answering the same `/health` check the original
application exposes. Nothing about parts, machines, or business data
yet. This lesson is about the problem underneath all of it: turning a
plain Python program into something a network client can talk to.

## What you need to know first

Nothing project-specific — this is the first lesson. General Python
(functions, `if __name__`) is assumed; everything Flask-specific is
taught from scratch, in
`concepts/flask-application-and-route-decorator.md`.

## Terms introduced

- **Application object** — the single Python object a Flask project
  builds, holding every route it registers and the machinery to listen
  for and answer HTTP requests.
- **Route decorator** — `@app.route(path)`, the syntax that registers a
  function as the handler for one specific URL path.
- **Development server** — the server `app.run()` starts: convenient for
  local work, never meant to face real internet traffic (that's a
  production server's job, a later, separate concern).
- **Application factory** — a function that builds and returns a fresh
  application object on each call, instead of one object built once, at
  import time.

---

## Concept Unit: A Flask Application, Running

### The Problem

The backend doesn't exist yet. Before anything else gets built, this
project needs the smallest possible thing a browser or `curl` can
actually reach — proof that a Python program can listen for, and
answer, a network request at all.

### Learn it in isolation

Full treatment, run this session, lives in
`concepts/flask-application-and-route-decorator.md` — not repeated
here. That file's isolation lab: a standalone Flask app on port 5099,
one route, run with `python lab.py`, then queried from a second
terminal:

```
hello, real server
unknown route status: 404
```

Direct proof from that file: a separate process reached the running
server and got back exactly what the handler function returned; a path
never registered with `@app.route` got Flask's own built-in `404`, with
no code written to produce it.

### Discard the throwaway example

That lab is discarded, per its own file — the port `5099` and the route
`/hello` never appear in this project.

### Project Change

- **Reference Source** — the original application's `app/__init__.py`,
  lines 172-244 (`create_app`, the application factory) and lines
  426-439 (the `health_check` route, registered inside it); `run.py`, in
  full. Cited because what follows is a deliberately smaller slice of
  what `create_app` does in the original — this unit ports only the
  Flask instance and the health route, not config loading, SQLAlchemy,
  CORS, SocketIO, Migrate, blueprint registration, or static/SPA
  serving. Each of those gets its own, later, small lesson, built once a
  feature actually needs it — named here explicitly, not silently
  dropped. What you're building is a smaller, honest version of that
  file, not a copy of it.
- **Two deliberate, temporary differences from the original**, tracked
  by `check-fidelity.mjs diff`'s own `--allow-new`, not silently
  accepted: the original `run.py` imports `create_app, socketio` and
  starts the app with `socketio.run(app, host='0.0.0.0', port=5000,
  debug=True)`; this lesson imports only `create_app` and starts it with
  `app.run(port=5000)`, since `socketio` doesn't exist in this project
  yet. Both are temporary stand-ins, replaced — not extended — the
  moment SocketIO gets its own lesson.
- **Files affected** — Created: `app/__init__.py`, `run.py`,
  `requirements.txt`, all under your backend folder.
- **Change type** — Add.
- **Location** — Brand-new files; nothing to locate a position within.
- **Dependencies** — An isolated virtual environment
  (`concepts/python-namespace-isolation-venv.md`, already cataloged)
  with `flask==3.0.0` installed into it.

One housekeeping note, stated once: this repo keeps your code under
`rebuild-3/backend/` and `rebuild-3/frontend/`, because two earlier,
abandoned attempts already occupy other folders in the same repo. That's
a fact about *this* repository's layout, not a concept to carry forward
— everywhere else in these lessons, "your backend" and "your frontend"
just mean whatever's inside that folder.

### Type this

Create `app/__init__.py`:

```python
from flask import Flask


def create_app(config_name: str = None) -> Flask:
    app = Flask(__name__)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Manufacturing Platform API is running'}

    return app
```

Create `run.py`:

```python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(port=5000)
```

Create `requirements.txt`, pinning the exact Flask version you just
installed into the venv:

```
flask==3.0.0
```

### The Updated Project

All three files are brand-new and shown whole above — there's nothing
existing to return to and recompose yet; `__init__.py`'s `create_app`
function already is the entire new structure.

### Mechanical Walkthrough

- `def create_app(config_name: str = None) -> Flask:` — **first
  appearance of the application factory pattern.** Instead of creating
  `app = Flask(__name__)` once, at module load time, the whole
  application is built and handed back by a callable function. Direct
  proof, from the original application's own comments (read this
  session): a test suite can call `create_app()` many times, once per
  test, each call producing a genuinely independent application object
  that shares no state with any other. `-> Flask` is a **type hint**
  (`concepts/python-function-type-hints.md`) — the `->` names the type a
  function returns; Python doesn't enforce it at runtime (nothing stops
  the function from returning something else), it's a documented promise
  to readers and tools like type checkers. `config_name: str = None` is
  the original's own parameter, ported now even though nothing inside
  this function reads it yet — matching the real signature costs nothing
  today, while the config-loading logic that will eventually use it
  waits for its own, later lesson.
- `app = Flask(__name__)` — the direct, applied use of
  `concepts/flask-application-and-route-decorator.md`'s first concept —
  now living *inside* the factory function instead of at a file's top
  level, the one structural difference from that file's own isolated
  lab.
- `@app.route('/health')` / `def health_check(): return {...}` — the
  direct, applied use of that same concept file's second and third
  pieces (the route decorator, a handler function), now registering this
  project's own `/health` path instead of the lab's `/hello`; the
  returned Python `dict` becomes serialized JSON automatically — Flask's
  own built-in behavior for a plain dict return value
  (`concepts/flask-implicit-dict-to-json.md`), confirmed live against
  the original application's own response this session.
- `return app` — reapplies already-established `return`; hands the
  configured application object back to whatever code called
  `create_app()`.
- `from app import create_app` in `run.py` — reapplies already-
  established Python import syntax, importing the factory function from
  the `app` package (`app/__init__.py`) just built.
- `app = create_app()` — the first actual call to the factory — proof
  this project now has one live application object to run.
- `flask==3.0.0` in `requirements.txt` — reapplies the already-
  established pinned-version convention (matching the original
  application's own `requirements.txt`, read this session) — an exact
  version, not a loose `flask>=3.0`, so a later install of this project
  gets identical behavior to what this lesson tested.
- `if __name__ == '__main__':` — reapplies
  `concepts/flask-application-and-route-decorator.md`'s already-
  established guard.
  `app.run(port=5000)` — its real declared shape (what `port` defaults
  to when omitted, what `host`/`debug` do, why the call blocks) is
  covered in `concepts/flask-run-method.md`, not repeated here; bound
  to port `5000` — the same port the original application's own
  `run.py` already uses (confirmed this session), so this server sits
  at the same address a frontend will later assume. What a port
  actually is, and why two programs can't share one, is covered in full
  in `concepts/network-port.md` — read it now if you haven't, since a
  port number appears in nearly every command from here forward.
  `127.0.0.1`, the address every command below connects to, is covered
  in `concepts/localhost-loopback-address.md`.

### Execution Trace

This code runs, so trace what actually happens on one real request —
that's what an execution trace means here, not just for a loop:

```
1. `python run.py` runs. `create_app()` executes once: it builds `app`,
   registers `/health` → `health_check` in Flask's internal routing
   table, and returns `app`. `app.run(port=5000)` binds port 5000 on
   127.0.0.1 and blocks — this process does nothing else until that
   call returns.
2. A separate process runs `curl http://127.0.0.1:5000/health`.
3. The operating system delivers the incoming connection to whichever
   process is bound to port 5000 — this process, and only this process
   (`concepts/network-port.md`).
4. Flask parses the request line, looks up the path `/health` in its
   routing table, finds `health_check` registered there, and calls it.
5. `health_check()` returns the dict
   `{'status': 'healthy', 'message': 'Manufacturing Platform API is running'}`.
6. Flask serializes that dict to JSON and sends it back as the response
   body, with a `200` status and a `Content-Type: application/json`
   header.
7. `curl` prints the body it received:
   `{"message":"Manufacturing Platform API is running","status":"healthy"}`
```

A request for any path other than `/health` never finds an entry in
step 4's routing table — traced concretely in "What breaks without
this," below, where `/health` itself is temporarily the unregistered
one.

### CS Lens

Not a new CS idea beyond what
`concepts/flask-application-and-route-decorator.md` already named (the
dispatch-table pattern). This unit's
own additional idea is the **factory pattern** — deferring construction
of a complex object to a callable function instead of building it once,
eagerly, at load time. Also recognized in: a database connection pool's
own `create_pool()`-style constructor, a GUI toolkit's `Application()`
object built fresh per test, and any class whose `__init__` alone isn't
enough to safely construct it (needing configuration decided at call
time, not import time).

### SE Lens

The factory function is chosen here specifically because this backend
will soon need more than one configuration — development, and
eventually testing, each wanting a genuinely independent application
object, sharing no state with any other. The alternative — a single,
module-level `app = Flask(__name__)`, built once when the file is first
imported — is simpler to read for this one lesson's scope, and is
honest technical debt this project would immediately owe the moment a
test needs its own isolated app. Choosing the factory now, before that
pressure exists, costs a small amount of present indirection (an extra
function call, one more level of nesting) in exchange for never having
to retrofit it later, under time pressure.

### Commands needed

```
python -m venv .venv
.venv/Scripts/python.exe -m pip install flask==3.0.0
.venv/Scripts/python.exe run.py
```

`python -m venv .venv` and the `pip install` step reapply
`concepts/python-namespace-isolation-venv.md`'s already-cataloged
commands, run
inside your backend folder. `python run.py` starts the server.

### Run it

Captured this session:

```
{"message":"Manufacturing Platform API is running","status":"healthy"}

unknown route: 404
```

Compared directly against the original application's own literal return
value, read this same session at `app/__init__.py` line 439 —
`{'status': 'healthy', 'message': 'Manufacturing Platform API is
running'}` — identical content, JSON key order aside (which carries no
meaning for a JSON object).

### Connect

This project now has one running server, answering the same `/health`
check the original application exposes — the smallest possible proof it
can be reached over HTTP at all. Every later route this project adds
registers into the same application object this lesson just built.

---

## Connect the pieces

One request, traced start to finish: `run.py` calls the `create_app()`
factory, which builds a `Flask(__name__)` instance and registers
`/health` against it via `@app.route`, then hands the object back;
`app.run(port=5000)` starts a listening server on that object. A `curl`
request to `http://127.0.0.1:5000/health` reaches Flask's own internal
dispatch table (`concepts/http-routing-dispatch-table.md`'s own pattern,
now inside Flask's actual source), finds `health_check` registered
there, calls it, and returns its dict as JSON — proven end to end by the
execution trace above, matching the original application's own literal
response.

## What breaks without this

Captured this session by temporarily removing the `@app.route('/health')`
decorator (keeping `health_check` itself unchanged, still a valid,
callable Python function):

```
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5000/health
```

```
404
```

A genuine Python function, fully correct on its own, exists and works —
but with no entry in Flask's dispatch table pointing at it, a request
for `/health` finds nothing there at all, and gets the same generic
`404` an entirely unregistered path would. Restored:

```python
    @app.route('/health')
    def health_check():
```

The same request, run again:

```
200
```

If you'd made a typo instead — say, `hea1th_check` — Python itself would
have stopped the server at startup with a traceback, not a `404` at
request time; `concepts/reading-a-stack-trace.md` covers how to read
that kind of error, the first time one shows up for real, in Lesson 1.2.

## Exercises

1. In your own words: why does `run.py` import `create_app` and call
   it, rather than `app/__init__.py` calling `app.run()` itself at the
   bottom of the file?
2. Add a second route, `/version`, returning a hardcoded version string
   as JSON — reapplying this lesson's own pattern for a second endpoint.
3. Run `node scripts/check-fidelity.mjs diff <commit> --allow-new "from
   app import create_app===app.run(port=5000)"` against this lesson's
   commit. In your own words: why do those two lines need `--allow-new`
   named explicitly, while `def create_app(config_name: str = None) ->
   Flask:` didn't need any exception at all?

## Definition of done

- [ ] `python run.py`, run inside your backend folder with the venv
      active, starts a listening server with no errors.
- [ ] `curl http://127.0.0.1:5000/health` returns the identical JSON
      content the original application's own `/health` route returns.
- [ ] A request to an unregistered path returns a `404`.
- [ ] `concepts/flask-application-and-route-decorator.md` exists, was
      run this session, and is referenced by name here rather than
      re-derived.
- [ ] `node scripts/check-fidelity.mjs diff <commit> --allow-new "from
      app import create_app===app.run(port=5000)"` exits 0 for every
      commit this lesson made.

Stage and commit:

```
git add .
git commit -m "Lesson 1.1: A Server That Answers"
```

**On `git commit -m "..."`, the first time it appears in this
curriculum:** a commit is a saved snapshot of every file you `git add`ed,
permanently recorded in the project's history. The `-m` message is not a
list of which files changed — git already records that automatically —
it's an explanation of *why* the snapshot exists: "the backend can now
be reached over HTTP at all, with the same health response the original
application gives," not "added __init__.py."
`concepts/git-basics-three-states-and-commit.md` covers the full model
this relies on — a file moves through three states, modified → staged
(`git add`) →
committed (`git commit`) — worth reading in full before your first real
commit, since every lesson from here on ends the same way.

---

**Next lesson:** the frontend's smallest first piece — a running
Vite/React/TypeScript page, then the two halves of this project actually
talking to each other for the first time.
