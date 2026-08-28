# Lesson 1: Pointing One Test at Two Real Apps

> **What "this project" means in this lesson.** Same as Lesson 0: every
> real path this lesson names is inside `manufacturing-platform`, a
> separate sibling repository, not `open-calc`. `manufacturing-platform`
> has one real, already-running Flask backend (`backend/`) and one
> deliberately empty target directory, `rebuild/backend/`, where a
> second backend will eventually be built from scratch — nothing exists
> there yet, not even a package. "legacy" and "new" below name which is
> which, not a value judgment about either; "new" stays empty until a
> later lesson actually builds something in it.

## What you will build

Not a feature — a small, real piece of infrastructure this whole
series depends on from here forward: one automated test, written once,
capable of running against either of this project's two real Flask
backends, chosen by an environment variable. This is deliberately the
entire scope of this lesson. The real subject is narrow on purpose:
proving the comparison mechanism itself works, once, so every later
lesson in this series can spend its own real content on an actual
feature instead of re-deriving how to reach two different real apps
from the same test.

## What you need to know first

Lesson 0 — `pytest`, the bare `assert`, and `create_app`, all reused
here exactly as they were there.

## Terms introduced

- **Acceptance test** — a test that checks a real, external contract —
  here, an HTTP request and the real response it produces — without
  depending on how the code answering it is internally built. Different
  from Lesson 0's test, which called `Part.to_dict()` directly: that
  test is tied to this project's current internal model structure and
  would have no way to run against a differently-structured
  implementation. An acceptance test is written so the same test can be
  pointed at more than one real implementation of the same contract.
- **Module cache** — Python's own real bookkeeping of every module
  it has already imported in the current process, keyed by module
  name. The second time anything in a running Python process writes
  `import app`, Python does not re-run `app`'s code at all — it hands
  back the exact same module object it already built the first time,
  from this cache. This matters directly for this lesson: this
  project's two real Flask backends both name their own top-level
  package `app` (`backend/app/` and `rebuild/backend/app/`) — so a
  single Python process that imported one, then tried to import the
  other by the same name, would silently get the *first* one back
  twice, never the second.
- **Environment variable** — a named value set in a process's own
  environment, readable from inside that process, without being passed
  as a function argument or command-line flag. This lesson uses one
  (`ACCEPTANCE_TARGET`) to tell a test, at the moment it starts running,
  which of the two real backends to reach — decided outside the test's
  own code, by whoever runs it.

## Objects and methods used

- **`Flask.test_client()`**
  - *What it is:* a real method on Flask's own `Flask` class, part of
    Flask's public API.
  - *Implementation:* checked against Flask's own official
    documentation this session — returns a real `FlaskClient` object
    exposing `.get(path)`, `.post(path, json=...)`, and the other real
    HTTP methods, each one sending a real, fully-formed request straight
    into the same `Flask` application object's own real routing and
    view-function code, entirely in-process — no real TCP socket, no
    real running server, no real open port, but every other part of a
    genuine request (method, path, headers, a real parsed body on the
    other end) behaves exactly as it would over real HTTP.
  - *Its use:* this lesson's test calls `app.test_client()` once per
    test to get a real client, then `.get('/health')` on it — the exact
    real HTTP boundary this whole series is built around, reached
    without needing either backend to actually be running as a separate
    process.
  - *Type:* an instance method on `Flask`, called on a real, already
    fully-assembled `app` object (via `create_app`, this project's own
    factory function, already given full treatment in Lesson 0).
  - *Responsibility:* handing back a real, ready-to-use object capable
    of sending real, in-process HTTP-shaped requests against this exact
    `Flask` app, and returning its exact real responses.
  - *Depends on:* a real, already-constructed `Flask` application object
    — the same one `create_app(...)` in Lesson 0's Header returns.
  - *Connects to:* called directly by this lesson's own test functions;
    everywhere else in this series from here forward, the way any
    acceptance test reaches either real backend.
  - *Shape:* a real Flask/Werkzeug testing boundary — the same real
    request-handling code path a genuine deployed server runs, minus
    only the actual network socket.

- **`Response.status_code`**
  - *What it is:* a real attribute on Werkzeug's own `Response` class —
    the class every object `Flask.test_client()` returns from `.get()`,
    `.post()`, and its other real HTTP methods actually belongs to.
  - *Implementation:* checked against Werkzeug's own official
    documentation this session — a plain integer, already set by the
    time a response object exists, holding the real HTTP status code
    (`200`, `404`, and so on) that response was built with.
  - *Its use:* this lesson's test reads it directly to check which real
    HTTP status code the `/health` route actually returned.
  - *Type:* an instance attribute on Werkzeug's `Response` class,
    holding an `int`.
  - *Responsibility:* exposing one specific response's already-decided
    HTTP status code as a plain Python value a test can compare against
    directly, with no parsing.
  - *Depends on:* a real `Response` object already returned by a call
    through this lesson's Header's `Flask.test_client()`.
  - *Connects to:* read directly by this lesson's own test function;
    the identical attribute exists on every response `test_client()`
    produces, project-wide, not just this one route.
  - *Shape:* part of the same real Werkzeug response boundary
    `Flask.test_client()` sits on — not project-specific.

- **`Response.get_json()`**
  - *What it is:* a real method on Werkzeug's own `Response` class,
    the same class `status_code`, above, belongs to.
  - *Implementation:* checked against Werkzeug's own official
    documentation this session — reads the response's real body text,
    parses it as JSON, and returns the result as a plain Python value
    (a `dict`, for a JSON object body); raises if the body isn't valid
    JSON.
  - *Its use:* this lesson's test calls it to turn the real `/health`
    route's JSON response body into a plain `dict` it can index and
    make a real assertion against.
  - *Type:* an instance method on Werkzeug's `Response` class, taking
    no required arguments, returning a parsed Python value.
  - *Responsibility:* converting one response's raw JSON text body into
    a real, usable Python value, so a test never has to parse JSON text
    by hand.
  - *Depends on:* a real `Response` object whose body is actually valid
    JSON text.
  - *Connects to:* called directly by this lesson's own test function;
    the identical method is available on every response
    `Flask.test_client()` returns, project-wide.
  - *Shape:* part of the same real Werkzeug response boundary
    `status_code`, above, sits on — not project-specific.

---

## Concept Unit: Reaching Either Real App by Name

### The Problem

`get_client()` needs to import `create_app` from `backend/app/` for one
real run, and from `rebuild/backend/app/` for another — two separate,
real Python packages that both happen to be named `app`. Importing both
by that same name, in the same Python process, without doing anything
about it, is genuinely broken — not a style concern, a real, silent
correctness bug: the **module cache**, defined above, means the second
`import app` would just hand back the first one already loaded, not the
second backend at all.

> **Before reading on:** if two files on disk are both importable as
> `app`, and Python only ever keeps one thing in its cache under that
> one name, what real, concrete strategy could avoid ever having both
> loaded in the same running process at once — without renaming either
> real project's own package?

### Project Change

- **Reference Source** — no reference counterpart; this is new,
  project-independent test infrastructure, not a port of anything
  either backend already does.
- **Files affected** — created: `acceptance-tests/target.py`,
  `acceptance-tests/test_health.py`, both new, directly inside a new
  `acceptance-tests/` folder at this project's own repository root,
  sibling to `backend/` and `rebuild/`.
- **Change type** — add (two new files).
- **Location** — brand-new folder; nothing to locate a position within.
- **Dependencies** — none beyond `pytest`, already installed in
  `backend/.venv` since Lesson 0.

### The New Code

```python
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_client():
    target = os.environ.get('ACCEPTANCE_TARGET', 'legacy')
    roots = {
        'legacy': 'backend',
        'new': 'rebuild/backend',
    }
    if target not in roots:
        raise ValueError(f"ACCEPTANCE_TARGET must be 'legacy' or 'new', got {target!r}")

    app_root = os.path.join(REPO_ROOT, roots[target])
    sys.path.insert(0, app_root)

    from app import create_app
    app = create_app('testing')
    return app.test_client()
```

`get_client()` alone has nothing to prove itself against — it's a
function that returns a client, not a test. This unit's own Project
Change, above, creates a second new file for exactly that reason, the
thing that actually calls it:

```python
from target import get_client


def test_health_returns_200_and_status_healthy():
    client = get_client()
    response = client.get('/health')
    assert response.status_code == 200
    body = response.get_json()
    assert body['status'] == 'healthy'
```

### The Updated Project

`acceptance-tests/target.py`, in full — brand new, so this is the whole
file:

```python
 1  import os
 2  import sys
 3
 4  REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
 5
 6
 7  def get_client():
 8      target = os.environ.get('ACCEPTANCE_TARGET', 'legacy')
 9      roots = {
10          'legacy': 'backend',
11          'new': 'rebuild/backend',
12      }
13      if target not in roots:
14          raise ValueError(f"ACCEPTANCE_TARGET must be 'legacy' or 'new', got {target!r}")
15
16      app_root = os.path.join(REPO_ROOT, roots[target])
17      sys.path.insert(0, app_root)
18
19      from app import create_app
20      app = create_app('testing')
21      return app.test_client()
```

`acceptance-tests/test_health.py`, in full — also brand new, so this is
the whole file too:

```python
1  from target import get_client
2
3
4  def test_health_returns_200_and_status_healthy():
5      client = get_client()
6      response = client.get('/health')
7      assert response.status_code == 200
8      body = response.get_json()
9      assert body['status'] == 'healthy'
```

### Mechanical Walkthrough

- **Line 1–2, `import os` / `import sys`** — two real Python standard
  library modules: `os` for real filesystem-path and environment-variable
  access, `sys` for real interpreter-level state, including the module
  search path this unit's whole strategy depends on.
- **Line 4, `REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))`**
  — `__file__` is a real, automatically-set variable holding the path to
  the currently-running file itself (`acceptance-tests/target.py`).
  `os.path.abspath(...)` turns that into a real, fully-resolved absolute
  path, regardless of what directory the test happened to be run from.
  `os.path.dirname(...)`, called twice in a row, walks up two real
  directory levels — once from the file to its own folder
  (`acceptance-tests/`), once more from there to this project's real
  repository root — computed this way instead of hardcoded so this file
  keeps working regardless of where this whole project is cloned to.
- **Line 8, `target = os.environ.get('ACCEPTANCE_TARGET', 'legacy')`**
  — `os.environ` is a real, dict-like object holding every real
  environment variable set for this process; `.get(...)` reads the real
  value of `ACCEPTANCE_TARGET` if the process was started with one set,
  or falls back to the literal string `'legacy'` if it wasn't — so
  running `pytest` with no special setup at all defaults to testing the
  real, already-existing application, not the empty one.
- **Lines 9–12, `roots = {...}`** — an ordinary Python `dict` naming
  the two real, valid choices and each one's real, relative path from
  `REPO_ROOT`.
- **Lines 13–14, `if target not in roots: raise ValueError(...)`** — a
  real, deliberate failure for anything other than exactly `'legacy'`
  or `'new'` — a typo'd `ACCEPTANCE_TARGET` fails loudly, immediately,
  with the actual bad value shown, rather than silently testing the
  wrong thing or crashing later with a confusing, unrelated error.
- **Line 16, `app_root = os.path.join(REPO_ROOT, roots[target])`** —
  builds one real, concrete, absolute path: either
  `.../manufacturing-platform/backend` or
  `.../manufacturing-platform/rebuild/backend`, never both in the
  same call.
- **Line 17, `sys.path.insert(0, app_root)`** — `sys.path` is a real,
  ordinary Python `list` — the ordered set of real directories Python
  actually searches, in order, whenever anything anywhere writes
  `import something`. `.insert(0, ...)` places this one specific real
  directory at the very *front* of that search list, for this process,
  starting right now — so the very next `import app`, anywhere in this
  process, finds *this* directory's `app` package before checking
  anywhere else.
- **Line 19, `from app import create_app`** — this is the line the
  previous one exists entirely to control. Because it's written
  *inside* the function, not at the top of the file, it only actually
  runs — and only actually populates the module cache — the moment
  `get_client()` is called, by which point line 17 has already decided,
  for this specific call, which real `app` package `sys.path` will find
  first.
- **Line 20, `app = create_app('testing')`** — this lesson's own
  Header's real `create_app`, already given full treatment in Lesson 0,
  reused here unchanged.
- **Line 21, `return app.test_client()`** — this lesson's Header's
  `Flask.test_client()`, handing back the real object every test in this
  series calls `.get(...)`/`.post(...)` on.
- **`test_health.py` line 1, `from target import get_client`** —
  imports this unit's own `get_client`, just defined above, from the
  sibling file it lives in; both files sit directly inside
  `acceptance-tests/`, so a plain, unqualified import resolves between
  them with no package structure needed.
- **Line 5, `client = get_client()`** — calls it, keeping the real
  object it returns — this lesson's Header's `Flask.test_client()`
  object, already pointed at whichever real backend `ACCEPTANCE_TARGET`
  names — in a local variable named `client`.
- **Line 6, `response = client.get('/health')`** — this lesson's
  Header's `Flask.test_client()`, its own `.get(path)` method, called
  here with the real path `'/health'`: sends a real, in-process `GET`
  request against whichever backend `client` was built for, returning a
  real `Response` object.
- **Line 7, `assert response.status_code == 200`** — this lesson's
  Header's `Response.status_code`, read here and compared, by real
  value, against the literal `200` — Lesson 0's own **Assertion**,
  applied to an HTTP status code for the first time: if the real code
  returned isn't exactly `200`, this line raises a real
  `AssertionError` and the test fails right here.
- **Line 8, `body = response.get_json()`** — this lesson's Header's
  `Response.get_json()`, called here with no arguments, keeping the
  real, parsed Python `dict` it returns in a local variable named
  `body`.
- **Line 9, `assert body['status'] == 'healthy'`** — a second real
  assertion: `body['status']` reads the real value at the `'status'`
  key of the real dict `get_json()` returned; `== 'healthy'` compares
  it, by real value, against the literal string `'healthy'` — this
  unit's actual claim about the real `/health` route, checked by the
  machine.

### CS Lens

This is a real, working instance of **namespace isolation via search-path
ordering** — the same real mechanism, at bottom, behind a Python virtual
environment itself: `sys.path`'s order, not any renaming of the actual
packages involved, is what decides which real `app` a given `import`
statement resolves to.

Also recognized in: shell `PATH`-order resolving which real `python` or
`node` binary a bare command name finds first when more than one is
installed; DLL/shared-library search-path ordering in compiled
languages; any plugin system where multiple real, independently-built
components are allowed to reuse the same internal module or class name
because nothing ever loads more than one of them into the same running
process at once.

### SE Lens

The real, deliberately chosen alternative *not* taken here: renaming one
backend's package (`rebuild/backend/app/` to something like `new_app/`)
would also avoid the collision, permanently, with less code. It's
rejected on purpose — this project's own real convention, everywhere
else, is that a Flask app's top-level package is named `app`; renaming
one real backend's package only to satisfy a test harness would make
that backend's own real code less consistent with the other one, for a
problem entirely local to how tests happen to be run. Isolating the
*process*, per call, via `sys.path`, keeps both real backends' own code
exactly as an ordinary Flask developer would expect it, and confines
this lesson's real workaround to the one file that actually needs it.

### Commands needed

This project's own real shell is PowerShell, not bash — the command
below uses PowerShell's own syntax for setting an environment variable
for a single command, because bash's `VAR=value command` form is not
valid PowerShell and fails with a `CommandNotFoundException` if typed
here.

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_health.py -v
```

`$env:ACCEPTANCE_TARGET='legacy'` — PowerShell's own real syntax for
setting an environment variable: `$env:<NAME>` is how PowerShell exposes
the current process's environment as assignable variables, and this
assignment sets `ACCEPTANCE_TARGET` for the rest of the current shell
session, not just one command — it stays set until the shell is closed
or the variable is reassigned. The `;` is PowerShell's statement
separator, running the assignment and then the next command in
sequence, the same real role a newline would play. The rest of the
command is the identical real pattern Lesson 0 already used: this
project's own `.venv`'s `python`, running `pytest` as a module, `-v`
for per-test verbose output.

### Run it, per the Verification Rule

Real output, this session, `ACCEPTANCE_TARGET=legacy`:

```
test_health.py::test_health_returns_200_and_status_healthy PASSED [100%]
1 passed in ...s
```

And, real output, this session, `ACCEPTANCE_TARGET=new` — `rebuild/backend`
has no `app` package at all yet:

```
    from app import create_app
E   ModuleNotFoundError: No module named 'app'

target.py:19: ModuleNotFoundError
1 failed in 0.05s
```

(Full real captures for both: `lesson-1-verification/`.) This second
run is not a mistake to fix — it's the honest, correct state of things
right now, proven rather than assumed: `rebuild` genuinely has
nothing in it yet, and this harness correctly says so instead of
silently testing the wrong backend or passing by accident.

### Connecting this unit to what came before

Lesson 0 proved a test could check one real, existing piece of this
project. This unit proves the same test can be pointed at either of
this project's two real backends by name — including, honestly, the one
that doesn't exist yet — which is exactly the real mechanism the next
lesson's actual rebuild work depends on.

---

## Connect the pieces

One real request, `GET /health`, moved through this whole lesson: sent
by a real `Flask.test_client()`, against whichever real backend
`ACCEPTANCE_TARGET` names, resolved correctly even though both backends
share the exact same internal package name, because `sys.path`'s real
search order — not either package's own name — decided which one
`import app` actually found. Nothing about this lesson taught a new
application feature; it proved the one piece of infrastructure every
later lesson in this series now gets to take for granted.

---

**Next lesson:** the actual first real feature — characterizing
`POST /api/auth/login`'s three real behaviors against `backend/`, then
building the smallest possible real Flask app in `rebuild/backend`
and the same route inside it, until the identical test passes there
too.
