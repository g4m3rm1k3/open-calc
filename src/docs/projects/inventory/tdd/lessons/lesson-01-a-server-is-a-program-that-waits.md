# Lesson 1: A Server Is a Program That Waits

## What you will build

A real, running Flask backend (`cnc-service`) with two routes: one that
returns a page, one that returns fake machine-status data as JSON. The page
fetches that fake data from the server and displays it live in the browser.
Nothing here is the real CNC engine yet — no parser, no G-code, no real
machine state. This lesson is purely the plumbing everything else will run
through: a program that stays alive, waits for requests, and answers them.
The transferable problem this lesson is really about: **how two separate
programs (a browser and a server) talk to each other over a network**, and
**how Python code gets organized into something a network can talk to at
all**.

## What you need to know first

Nothing — this is Lesson 1. You already know basic Python (variables,
functions, `dict`/string literals, `print`) — that part isn't re-taught
here. Everything else (virtual environments, Flask, decorators, HTML,
JavaScript, HTTP) is taught from first principles below.

## Concepts cataloged from this lesson

Every concept this lesson introduces now has its own isolated, runnable
entry in `../concepts/` (per `extraction.md`'s Concept Catalog Rule) — a
later lesson only skips re-teaching one of these on a **100% match**, never
on resemblance. Added retroactively; the teaching below is unchanged.

`client-server-architecture` · `http-request-response` ·
`python-namespace-isolation-venv` · `dependency-graph-resolution` ·
`python-dunder-name` · `python-decorators` ·
`python-if-name-main-idiom` · `http-routing-dispatch-table` ·
`template-rendering-separation-of-concerns` · `xss-auto-escaping-jinja2` ·
`serialization-deserialization` · `flask-implicit-dict-to-json` ·
`event-loop` · `localhost-loopback-address` · `network-port` ·
`dev-server-debug-mode-risk` · `html-id-attribute` ·
`javascript-arrow-functions` · `fetch-api` · `javascript-promises-async` ·
`dom-get-element-by-id` · `textcontent-vs-innerhtml-xss` ·
`json-stringify` · `python-import-statement` · `stub-placeholder-pattern` ·
`health-check-endpoint` · `logging-and-observability`

*(`python-import-statement` added retroactively — found missing while
auditing Lesson 2, which reuses `from X import Y` and needed something to
point at. `stub-placeholder-pattern` added retroactively — found missing
while auditing Lesson 13, which explicitly calls `FAKE_MACHINE_STATUS`
back as the same shape it reuses for a second real feature area.
`health-check-endpoint` and `logging-and-observability` added
retroactively — real, honest gaps found while cross-referencing a
professional-software-engineering-concepts checklist against this
project's actual code: `/api/status` is a health check in everything but
name, and this project has no real logging anywhere.)*

## No pipeline diagram yet

This curriculum will eventually have a named pipeline
(`Text → Tokens → Commands → Machine State → Points → Picture`) once a real
G-code lexer and parser exist. Neither exists yet — this lesson is the
bootstrap that everything else runs on top of, not a stage of that pipeline.

## Before any code: what is a client and a server?

*(Full standalone treatment: `../concepts/client-server-architecture.md` and
`../concepts/http-request-response.md`.)*

A **server** is a program that starts, then waits — forever, in a loop —
for another program to ask it for something. It doesn't run once and exit
like a script you're used to; it stays alive between requests. A **client**
is the program that does the asking. Your web browser is a client. The
Python program you're about to write is a server. They are two separate,
independently-running programs, usually on two different machines in the
real world — today, both happen to run on your one machine, but the
mechanism (a network request over HTTP) is identical either way.

**HTTP** (HyperText Transfer Protocol) is the agreed-upon format both sides
use to talk: the client sends a **request** (a method like `GET`, a path
like `/api/status`, and optional data), the server sends back a
**response** (a status code like `200` for success or `404` for "not
found", plus a body — HTML, JSON, or anything else).

---

## Concept Unit: Isolating Project Dependencies (Virtual Environments)

*(Full standalone treatment: `../concepts/python-namespace-isolation-venv.md`.)*

### The Problem

Python packages (like Flask) get installed somewhere on your machine. If
you install every package globally, every Python project on your computer
shares the same set of package versions. Project A might need Flask 2.0;
Project B might need Flask 3.1 with a feature that didn't exist in 2.0.
Installing one breaks the other. This isn't hypothetical — it's the single
most common reason a tutorial that "worked yesterday" stops working today.

### The Concept, Isolated

A **virtual environment** is a private, self-contained folder holding its
own copy of the Python interpreter and its own `site-packages` (where
installed packages live). Packages installed "into" a virtual environment
are invisible to every other virtual environment and to your system Python.
There's no smaller disposable example needed here — the command itself
*is* the smallest demonstration, and we ran it for real:

```
python -m venv .venv
```

`python` invokes the Python interpreter. `-m venv` tells it to run the
`venv` module as a program (rather than importing it) — `venv` is a module
in Python's standard library whose whole job is creating these isolated
folders. `.venv` is the name we chose for the folder it creates (the
leading dot is a convention on Unix-like systems for "hidden, not usually
looked at directly"; Windows honors the same convention loosely).

**Real output:** the command produced no printed output on success (silence
means success for most CLI tools — a convention worth naming the first
time, since a beginner often expects a "done!" message that never comes).
We verified it worked a different way:

```
Test-Path ".venv\Scripts\python.exe"
True
```

`Test-Path` is a PowerShell cmdlet (a PowerShell-native command, as opposed
to an external program like `python`) that returns `True`/`False` for
whether a file or folder exists. `.venv\Scripts\python.exe` is where the
new environment's *own, private copy* of the Python interpreter now lives
— proof the isolated folder is real, not just a claim.

### Project Change

- **Reference Source** — none. The reference app (`cnc/CNCEngine.ts`,
  `cnc-sim/cnc/*`) has no backend at all — it's client-only, storing
  everything in the browser's `localStorage`. A Python backend, and
  therefore a Python virtual environment, is a deliberate addition beyond
  the reference, motivated by wanting real persistence and a real API —
  see `CURRICULUM.md`'s target architecture.
- **Files affected** — new folder `cnc-service/.venv/` (created, not
  hand-written — `venv` generates its contents).
- **Change type** — add.
- **Location** — `cnc-service/`, a new top-level folder alongside the
  existing `cnc/` and `cnc-sim/` reference folders.
- **Dependencies** — a working Python install (verified: `Python 3.13.14`).

### What activation actually does

Tutorials always show an extra step: "activate" the environment. On this
machine, in PowerShell:

```
.venv\Scripts\Activate.ps1
```

I didn't run this — every command I ran called the environment's
`python.exe` by its full path instead
(`.\.venv\Scripts\python.exe -m pip install flask`). Both approaches do
the *same* thing for a different reason, and understanding why matters more
than memorizing the ritual: I opened `Activate.ps1` and read what it
actually does — its own docstring states it plainly — *"Pushes the python
executable for a virtual environment to the front of the `$Env:PATH`
environment variable, and sets the prompt to signify that you are in a
Python virtual environment."* `$Env:PATH` is the list of folders Windows
searches, in order, when you type a bare command name like `python`.
Activating temporarily puts `.venv\Scripts\` first in that list, so typing
`python` finds the venv's copy instead of your system's. Calling
`.\.venv\Scripts\python.exe` directly skips the PATH lookup entirely and
points at the exact same file — no activation needed, just more typing.
**You can use either.** This project's lesson commands below show the
activated form, since that's what you'll type interactively; know that the
explicit-path form is what actually ran during verification and is always
a valid fallback if activation ever fails (a common failure on Windows:
PowerShell's execution policy blocking `.ps1` scripts entirely — verified
on this machine as `Get-ExecutionPolicy` → `Bypass`, meaning it won't
happen here, but it's a real, well-known error on stricter setups, with a
real fix: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`).

### CS Lens

This is **namespace isolation** — the general computer-science idea of
giving two things the same name (`flask`, version *whatever*) separate,
non-interfering storage locations, resolved by *context* (which environment
is active) rather than by making names globally unique.

Also recognized in: Docker containers (isolating entire operating system
dependencies, not just Python packages), Node.js's per-project
`node_modules/`, Java's classpath scoping, and even DNS split-horizon
resolution (the same hostname resolving differently depending on which
network you're asking from).

### SE Lens

The alternative — installing everything globally — is genuinely simpler
for a single, permanent project. It stops being simpler the moment you have
two projects with conflicting version needs, which for any working
developer is "immediately, and forever after." The real, ongoing cost of
*not* isolating: an upgrade for Project B silently breaks Project A, and
the failure shows up as a confusing runtime error in A with no clue that B
is the cause. Isolating per-project trades a small amount of setup
ceremony now for eliminating an entire, hard-to-diagnose class of bug
later.

---

## Concept Unit: Installing and Recording a Dependency

*(Full standalone treatment: `../concepts/dependency-graph-resolution.md`.)*

### The Problem

We need Flask itself — it doesn't ship with Python. And whoever runs this
project later (including future you, on a new machine) needs to install
the *exact same* thing, not "whatever the newest version happens to be
that day."

### The Commands, Run for Real

```
.\.venv\Scripts\python.exe -m pip install flask
```

`pip` is Python's package installer (Python's equivalent of `npm` for
Node). `-m pip` runs it as a module, same reasoning as `-m venv` above.
`install flask` is the subcommand and package name — `pip` looks `flask`
up on PyPI (the Python Package Index, the default public registry) and
downloads it, plus anything *it* depends on.

**Real output (abridged):**
```
Collecting flask
  Using cached flask-3.1.3-py3-none-any.whl.metadata (3.2 kB)
Collecting blinker>=1.9.0 (from flask)
Collecting click>=8.1.3 (from flask)
Collecting itsdangerous>=2.2.0 (from flask)
Collecting jinja2>=3.1.2 (from flask)
Collecting markupsafe>=2.1.1 (from flask)
Collecting werkzeug>=3.1.0 (from flask)
Successfully installed blinker-1.9.0 click-8.4.2 colorama-0.4.6 flask-3.1.3
itsdangerous-2.2.0 jinja2-3.1.6 markupsafe-3.0.3 werkzeug-3.1.8
```
Flask itself depends on five other packages (`Jinja2` for templating,
`Werkzeug` for the actual HTTP handling underneath Flask, `click` for its
command-line tool, `itsdangerous` and `blinker` for signing/event support).
`pip` resolved and installed all of them automatically — this is
**transitive dependency resolution**: you asked for one thing, and got its
whole real dependency graph, versions chosen to satisfy every package's
stated constraints (`>=1.9.0` etc.) simultaneously.

Then, to record exactly what got installed:
```
.\.venv\Scripts\python.exe -m pip freeze > requirements.txt
```
`pip freeze` prints every installed package and its *exact* version.
`>` is a shell redirection operator — instead of printing to the screen, it
writes that output into a file, creating it if it doesn't exist or
overwriting it if it does.

**Real `requirements.txt` produced:**
```
blinker==1.9.0
click==8.4.2
colorama==0.4.6
Flask==3.1.3
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.3
Werkzeug==3.1.8
```
`==` (exactly-equals, not a range like venv's own `>=`) pins each package
to one precise version.

### Project Change

- **Reference Source** — none (see previous unit; no backend exists in the
  reference to have dependencies from).
- **Files affected** — new `cnc-service/requirements.txt`.
- **Change type** — add.
- **Location** — `cnc-service/`, alongside the `.venv/` folder.
- **Dependencies** — the virtual environment from the previous unit must
  exist first.

### CS Lens

**Dependency graph resolution** — the same general problem package
managers across every ecosystem solve: given a set of requested packages
each with their own version constraints, find one consistent set of
versions satisfying all constraints at once (or fail loudly if none
exists).

Also recognized in: `npm`/`package-lock.json` (the JavaScript equivalent,
covered in this same project's future frontend lessons), Java's Maven/
Gradle, Rust's Cargo, Linux distributions' own package managers (`apt`,
`dnf`).

### SE Lens

The alternative to `requirements.txt` is telling a teammate "just `pip
install flask`" and hoping they get a compatible version. That works right
up until Flask ships a breaking change between when you built the project
and when they set it up — a real, silent version-drift bug with no error
message pointing at the cause. Pinning trades a small amount of staleness
risk (you won't automatically get security patches) for total
reproducibility. The honest debt this project is taking on: nobody has
written an *upgrade* process yet — `requirements.txt` will need to be
regenerated by hand (`pip freeze > requirements.txt` again) any time a
package is deliberately upgraded.

---

## Concept Unit: The Application Object and Module Identity

*(Full standalone treatment of `__name__`: `../concepts/python-dunder-name.md`.)*

### The Problem

Before we can define any route, we need *something* to attach routes to —
a single object representing "this web application," that Flask's
machinery can hand incoming requests to.

### The New Code

```python
from flask import Flask, render_template

app = Flask(__name__)
```

### The Updated Project

This is the entire top of a brand-new file, `cnc-service/app.py` — nothing
precedes it yet, so there's no larger enclosing structure to show it
inside of.

### Mechanical Walkthrough

*(Full standalone treatment of the `import` statement itself:
`../concepts/python-import-statement.md`.)*

Enumerating every element in order:

- `from flask import Flask, render_template` — **(a) first appearance.**
  `flask` is the package we just installed. `from X import Y` pulls
  specific names out of a module instead of requiring the longer
  `flask.Flask` every time. `Flask` (capital F) is a *class* — a blueprint
  for creating application objects. `render_template` is a *function* we
  imported now because we'll need it two units from here — imports are
  declared once, up front, even if used slightly later in the same file.
- `app = Flask(__name__)` — **(a) first appearance**, several ideas at
  once:
  - `Flask(__name__)` **calls** the `Flask` class like a function — in
    Python, calling a class creates a new *instance* of it (an actual
    application object), running that class's setup code with `__name__`
    as the argument it's told about itself.
  - `__name__` — **(a) first appearance.** Every Python file, when run,
    has a built-in variable called `__name__` automatically set by the
    interpreter to a string identifying that file. Flask uses this value
    to figure out where *this file* lives on disk, so it knows where to
    look for the `templates/` and `static/` folders relative to it. It is
    not a value we chose — it's supplied by Python itself the moment this
    file is loaded, which is exactly why every Flask tutorial's first line
    looks identical: `__name__` is doing real, specific work, not
    decoration.
  - `app = ...` — an assignment, already-known basic Python; the resulting
    object is stored under the name `app`, which is what the rest of this
    file (and Flask's own internals) will refer to going forward.

### CS Lens

This is straightforward **object instantiation** — no new CS concept
beyond what "basic Python" already covers (classes and objects), so no
new lab is owed here. What's new is *whose* class this is and what it
represents: a single, live, in-memory object modeling "the whole web
application," which every subsequent route attaches itself to.

### SE Lens

Flask could have been designed as a set of free-standing functions with no
central object (some tiny frameworks work this way). Centralizing
everything on one `app` object is what makes it possible to run *two
independent Flask applications in the same Python process* later if ever
needed (each its own `Flask(__name__)`), and it gives every piece of
configuration (routes, settings, error handlers) one obvious place to
attach to instead of being scattered as global state.

### Commands

None yet — this file can't run standalone until it has at least one route
and a way to start the server. Both come in the next two units.

---

## Concept Unit: Decorators — Wrapping a Function's Behavior

*(Full standalone treatment: `../concepts/python-decorators.md`.)*

### The Problem

Flask needs a way to say "when a request for path `/` comes in, call
*this specific function*." It could ask you to register that manually
(`app.add_url_rule("/", index)`), but Python has a more direct, more
common syntax for "here is extra behavior that should apply to the
function defined right below this line" — and Flask uses it. Before
seeing it used for real, the underlying mechanism needs its own,
disposable demonstration — decorators are dense enough, and reused often
enough elsewhere in Python, to earn a lab even though "basic Python" may
already cover plain function definitions.

### The Concept, Isolated

```python
def shout(func):
    def wrapper():
        original_result = func()
        return original_result.upper()
    return wrapper

@shout
def greet():
    return "hello"

print(greet())
```

**Real output, run this session:**
```
HELLO
```

**What this proves:** `@shout` placed directly above `def greet():` did
not just add a comment or a label — it silently *replaced* `greet` with
`wrapper` (the inner function `shout` returned). Calling `greet()` now
actually calls `wrapper()`, which calls the *original* `greet` internally
(captured as `func`), then uppercases whatever it returned. `greet` itself
never changed — its behavior was wrapped from the outside, without
touching its body. `@shout` above a function is exactly equivalent to
writing `greet = shout(greet)` immediately after defining `greet` — the
`@` syntax is shorthand for that reassignment, nothing more.

### Discard

This `shout`/`greet`/`wrapper` example is deleted now. It will not appear
in the project again — it existed only to prove what `@` does.

### Project Change

- **Reference Source** — none; decorators are a Python language feature,
  not something ported from the (JavaScript/TypeScript) reference app.
- **Files affected** — `cnc-service/app.py` (already created in the
  previous unit).
- **Change type** — add (appending a function + decorator to the existing
  two lines).
- **Location** — directly below `app = Flask(__name__)`.
- **Dependencies** — the `app` object from the previous unit.

### Connection to what came before

The same mechanism just proven with `shout`/`greet` is what Flask's own
`@app.route(...)` — shown next — is built on: a decorator that wraps your
function with extra behavior (registering it to answer a specific URL)
without changing what your function's own body does.

---

## Concept Unit: Registering a Route

*(Full standalone treatment: `../concepts/http-routing-dispatch-table.md`
(routing/dispatch), `../concepts/template-rendering-separation-of-concerns.md`
(`render_template`), and `../concepts/xss-auto-escaping-jinja2.md` (the
escaping safety net named in the SE Lens below).)*

### The Problem

We need one real, visitable page — something a browser can load at all,
before we worry about it showing real data.

### The New Code

```python
@app.route("/")
def index():
    return render_template("index.html")
```

### The Updated Project

`cnc-service/app.py` so far, in full — nothing elided:

```python
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")
```
As a whole, this file now: creates one Flask application, and tells it
that a browser requesting the path `/` (the site's root) should be
answered by running `index()`, which hands back a rendered HTML page.

### Mechanical Walkthrough

- `@app.route("/")` — **(a) first appearance**, applying the decorator
  concept just proven above. `app.route` is a *method* on the `app` object
  (a function that belongs to it) that itself **returns** a decorator —
  one extra layer beyond the `shout` example, where `shout` *was* the
  decorator directly. `app.route("/")` first runs, producing a
  ready-to-use decorator, which is then applied to `index`, exactly the
  way `@shout` was applied to `greet`. `"/"` is the **path** portion of
  the URL — everything after the domain and port. Flask stores, inside
  `app`, "when path `/` is requested, call `index`."
- `def index():` — basic Python, already known; note only that the
  function's *name* (`index`) is a real HTTP/web convention for "the
  default page of a site," not a Flask requirement — it could be called
  anything.
- `return render_template("index.html")` — **(a) first appearance.**
  `render_template` (imported earlier) looks for a file named
  `index.html` inside a folder called `templates/`, located next to
  `app.py`, reads it, and returns its contents as the HTTP response body.
  Flask enforces this folder name and location by convention — you don't
  configure it, you just put files there and it works, which is precisely
  why the next Project Change creates `templates/index.html` in that
  exact location.

### Project Change

- **Reference Source** — none (see Decorators unit above).
- **Files affected** — `cnc-service/app.py` (modified, code above);
  `cnc-service/templates/index.html` (new).
- **Change type** — add.
- **Location** — the route function goes directly below `app = Flask(...)`.
  The template file goes in a brand-new `templates/` subfolder — Flask
  looks there automatically, so the folder's existence and name are not
  optional.
- **Dependencies** — the `app` object; Flask's own convention for the
  `templates/` folder name.

### CS Lens

This is **routing** — a lookup table from (method, path) pairs to handler
functions, conceptually identical to a dictionary keyed by URL. Flask
builds and consults this table internally; we never see the table itself,
only the decorator syntax that populates one entry in it.

Also recognized in: every web framework that exists (Express.js, Django,
ASP.NET, Ruby on Rails), and more generally in any dispatch-table pattern
— the same shape as a `switch` statement or a game engine's input-to-action
mapping.

### SE Lens

`render_template` reading a *separate* `.html` file, instead of the route
returning an HTML string built directly in Python
(`return "<html>...</html>"`), is **separation of concerns**: the
route's job is deciding *what* to show; the template's job is deciding
*how it looks*. The real, concrete payoff arrives the moment a template
needs to include real data — Jinja2 (the templating engine Flask uses
under `render_template`) automatically **escapes** any value inserted into
a template, which is the actual production defense against
Cross-Site-Scripting (XSS): if a future lesson ever renders
user-submitted text through a template variable, Jinja2 converts any `<`,
`>`, or `"` characters in it into harmless text automatically, so the
browser displays it instead of executing it as HTML/JavaScript. We aren't
using that yet — `index.html` has no template variables in this lesson —
but the safety net is already in place the moment we chose
`render_template` over a hand-built string.

### Commands / Run

Not runnable standalone yet — `templates/index.html` doesn't exist until
the next step, and the server itself isn't started until two units from
now. Verified together at the end of this lesson.

---

## Concept Unit: Returning Data Instead of a Page

*(Full standalone treatment: `../concepts/serialization-deserialization.md`
(the general concept) and `../concepts/flask-implicit-dict-to-json.md`
(Flask's specific automatic behavior).)*

*(Added retroactively, found missing while cross-referencing a real
"what every professional developer should know" checklist: `/api/status`
is, functionally, this project's first real **health check endpoint** —
never named as one. Full standalone treatment:
../concepts/health-check-endpoint.md.)*

*(A second, related, honest gap named the same session: every lesson in
this project verifies real behavior with `print()`/manual command
transcripts, by deliberate pedagogical choice — but this project's actual
`cnc-service` code has no real logging framework at all, anywhere.
A real, deployed, unattended version of this backend would need one.
Full standalone treatment: ../concepts/logging-and-observability.md.)*

### The Problem

A real page is one thing; but the whole reason for a backend at all
(per `CURRICULUM.md`'s architecture) is serving *data* a frontend can use
programmatically — not just human-readable HTML. We don't have a real
machine yet, so we'll serve **fake, hardcoded data shaped like what a real
one will eventually return** — named explicitly as fake, so nobody mistakes
it for real machine communication later.

### The New Code

```python
FAKE_MACHINE_STATUS = {
    "machine": "mill-3axis",
    "status": "idle",
    "position": {"x": 0.0, "y": 0.0, "z": 0.0},
}


@app.route("/api/status")
def get_status():
    return FAKE_MACHINE_STATUS
```

### The Updated Project

`cnc-service/app.py`, in full, nothing elided:

```python
from flask import Flask, render_template

app = Flask(__name__)

FAKE_MACHINE_STATUS = {
    "machine": "mill-3axis",
    "status": "idle",
    "position": {"x": 0.0, "y": 0.0, "z": 0.0},
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status")
def get_status():
    return FAKE_MACHINE_STATUS
```
The file now answers two different paths: `/` returns a page, `/api/status`
returns data. `/api/...` as a path prefix is a naming convention (not a
Flask requirement) this project will keep using for every route that
returns data instead of a page — it's already establishing a pattern the
next lesson's real routes will follow.

### Mechanical Walkthrough

- `FAKE_MACHINE_STATUS = {...}` — a dict literal, already-known basic
  Python; note only the shape, since it's a deliberate, forward-looking
  choice: `position` as a *nested* dict (not three separate top-level
  keys) previews the real shape a machine's actual X/Y/Z position will
  take once a real `MachineState` exists. *(Added retroactively, found
  missing while auditing Lesson 13: this is this project's first real
  **stub** — a deliberately simple, hardcoded placeholder standing in for
  data that doesn't exist yet. Full standalone treatment:
  ../concepts/stub-placeholder-pattern.md.)*
- `@app.route("/api/status")` — **(b) hard concept reappearing** (the
  routing decorator, just taught in full above) — same mechanism, second
  path.
- `return FAKE_MACHINE_STATUS` — **(a) first appearance** of genuinely new
  Flask behavior: returning a `dict` directly from a route function.
  Flask detects that the returned value is a `dict`, automatically calls
  Python's `json` module to convert it to a JSON-formatted string, and
  sets the HTTP response's `Content-Type` header to `application/json` —
  all without being asked. This is **not standard Python** — a plain
  Python function returning a dict just returns a dict object; this
  auto-conversion is Flask-specific behavior worth naming explicitly so it
  isn't mistaken for how Python works in general.

**Real, verified output** (server started in the next unit, requested
here to confirm this route specifically):
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/status"

machine    position               status
-------    --------               ------
mill-3axis @{x=0.0; y=0.0; z=0.0} idle
```
(PowerShell's `Invoke-RestMethod` automatically parses the JSON response
into an object and prints it as a table — the real underlying bytes on
the wire are confirmed below in this lesson's Closing section.)

### CS Lens

Converting an in-memory data structure (a Python `dict`) into a portable
text format (JSON) is **serialization** — turning structured memory into
bytes that can cross a process or network boundary and be reconstructed
elsewhere. The reverse (JSON text back into a language's native structure)
is **deserialization**.

Also recognized in: literally every API on the internet, saving a game's
state to a file, `pickle`/`JSON.stringify` in general, protocol buffers,
database row-to-object mapping (ORMs).

### SE Lens

The alternative — manually building a `Response` object, calling
`json.dumps(...)` yourself, and setting `Content-Type: application/json`
by hand — is maybe four extra lines, not a large cost. Flask's shortcut
trades a small amount of implicit "magic" (a beginner reading this code
cold has no way to know a `dict` return does all that without being told,
which is why this unit exists) for removing four lines of repeated
boilerplate from *every single route* that returns data — and this
project is about to have many such routes.

### Commands / Run

Not runnable standalone yet — the server hasn't been started. Next unit.

---

## Concept Unit: Making the Module Runnable

*(Full standalone treatment: `../concepts/python-if-name-main-idiom.md`,
`../concepts/event-loop.md` (named in the CS Lens below),
`../concepts/localhost-loopback-address.md`, `../concepts/network-port.md`,
and `../concepts/dev-server-debug-mode-risk.md` (the `debug=True` tradeoff).)*

### The Problem

Everything so far *defines* an application; nothing yet actually starts
it listening for requests.

### The New Code

```python
if __name__ == "__main__":
    app.run(debug=True)
```

### The Updated Project

The complete, final `cnc-service/app.py` for this lesson:

```python
from flask import Flask, render_template

app = Flask(__name__)

FAKE_MACHINE_STATUS = {
    "machine": "mill-3axis",
    "status": "idle",
    "position": {"x": 0.0, "y": 0.0, "z": 0.0},
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status")
def get_status():
    return FAKE_MACHINE_STATUS


if __name__ == "__main__":
    app.run(debug=True)
```
As a whole, this is now a complete, standalone program: run it directly,
and it creates the application, registers both routes, and starts a real
network server that keeps running (per this lesson's opening definition of
"server") until stopped.

### Mechanical Walkthrough

- `if __name__ == "__main__":` — **(a) first appearance**, a very common
  Python idiom worth explaining precisely rather than assuming: recall
  `__name__` is automatically set by Python to identify the current file.
  When a file is run **directly** (`python app.py`), Python sets that
  file's `__name__` to the literal string `"main"`. When a file is instead
  **imported** by another file (`import app`), its `__name__` is set to
  its own module name (`"app"`) rather than `"main"`. This `if` therefore
  means: "only do the following if this exact file was the one you ran
  directly — not if some other file imported me for my routes/functions."
  This matters the moment a real test suite exists (a later lesson) and
  needs to import `app` without accidentally starting a live server as a
  side effect of importing it.
- `app.run(debug=True)` — **(a) first appearance.** `.run(...)` is a
  method on the Flask application object that starts Werkzeug's built-in
  development web server and blocks — the program stops at this line and
  waits, exactly matching this lesson's opening definition of what a
  server *is*. `debug=True` is a **keyword argument** (already-known
  basic Python syntax) turning on two real behaviors: (1) the server
  automatically restarts itself whenever a `.py` file in the project
  changes, so edits take effect without manually stopping and restarting
  it; (2) if a route's code raises an uncaught error, the browser shows an
  interactive, in-page debugger with a live Python console *inside the
  error page* — genuinely useful while developing, and a genuinely serious
  security hole if ever left on and exposed to a real network, since that
  live console can execute arbitrary Python on the server for anyone who
  can reach the error page. **Named as real, current debt:** this project
  will need to turn `debug` off (or condition it on an environment
  variable) before it is ever exposed beyond `localhost` — not a problem
  today, since nothing here leaves this one machine, but a real,
  remembered fact, not a silent gap.
- With no `host`/`port` arguments given, Flask defaults to
  **`127.0.0.1`, port `5000`**. `127.0.0.1` (spoken "localhost") is a
  special IP address that always means "this same machine" — a request
  sent to it never leaves the computer it originated from, which is why
  nothing outside your machine can reach this server right now. A **port**
  is a number (0–65535) identifying *which* program on a machine should
  receive a given network message — a machine can run many programs
  listening simultaneously, each on its own port, the way an apartment
  building's single street address still routes mail to a specific unit
  number. Port `5000` is simply Flask's chosen default; nothing is special
  about the number itself.

### Commands and Real Output

```
.\.venv\Scripts\python.exe app.py
```
**Real terminal output:**
```
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 131-557-654
```
Every line here is real and worth reading, not skimming: the `WARNING` is
Flask itself telling you, honestly, that this server is for development
only (a *production* server — handling real, public traffic — needs a
separate, more robust program, a later-lesson concern). `Running on
http://127.0.0.1:5000` confirms the address just explained above.
`Restarting with stat` and the debugger PIN are both `debug=True`'s doing,
also just explained above. `Press CTRL+C to quit` is how you, sitting at a
real keyboard, stop the server — sending an interrupt signal to the
process.

**Then, verified live, from a second terminal, while the server was still
running in the first:**
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/status"

machine    position               status
-------    --------               ------
mill-3axis @{x=0.0; y=0.0; z=0.0} idle

(Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -UseBasicParsing).StatusCode
200
```
Two separate, real programs — the server in one terminal, the request in
another — communicating over `127.0.0.1:5000`, exactly as described.

### CS Lens

The server sitting inside `app.run()`, waiting indefinitely for input, is
an **event loop** in its simplest possible form — a loop whose entire body
is "wait for something to happen, then react," as opposed to a normal
script's "run start to finish and exit."

Also recognized in: every GUI application (waiting for clicks), every
game's main loop (waiting for the next frame/input), Node.js's entire
runtime model, and — very directly relevant to this project's actual
subject — a real CNC machine controller's own firmware loop, which spends
almost all of its life waiting for the next line of G-code or the next
sensor tick.

### SE Lens

`debug=True` versus `debug=False` is a real, direct tradeoff already
named above in the walkthrough: fast iteration and rich error info during
development, versus a real remote-code-execution risk if ever shipped
as-is. Nothing forces you to remember to turn it off — that's exactly why
it's written down here as named, current debt rather than left implicit.

---

## Concept Unit: Asking the Server for Data From the Browser

*(Full standalone treatment: `../concepts/html-id-attribute.md`,
`../concepts/fetch-api.md`, `../concepts/javascript-promises-async.md`,
`../concepts/javascript-arrow-functions.md`,
`../concepts/dom-get-element-by-id.md`,
`../concepts/textcontent-vs-innerhtml-xss.md`, and
`../concepts/json-stringify.md`.)*

### The Problem

`/api/status` now returns real JSON when asked directly — but a human
looking at a web page shouldn't have to know that URL exists or read raw
JSON. The page itself needs to ask for it and display it.

### The New Code

```html
<script>
    fetch("/api/status")
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("status").textContent = JSON.stringify(data, null, 2);
        });
</script>
```

### The Updated Project

The complete `cnc-service/templates/index.html`:

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>cnc-service</title>
</head>
<body>
    <h1>Machine Status</h1>
    <pre id="status">loading...</pre>

    <script>
        fetch("/api/status")
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("status").textContent = JSON.stringify(data, null, 2);
            });
    </script>
</body>
</html>
```
As a whole: the browser loads this page, immediately shows the literal
text "loading..." inside the `<pre>` element, then — the instant the
fetch completes — replaces it with the real data just retrieved from the
server, with no page reload.

### Mechanical Walkthrough

- `<pre id="status">loading...</pre>` — HTML, not previously taught in
  this project: `<pre>` is an HTML element that displays its text exactly
  as written (preserving whitespace/line breaks), which matters below
  since we'll display indented, multi-line JSON. `id="status"` is an
  **attribute** giving this specific element a unique name so JavaScript
  can find it later — **(a) first appearance** of an HTML attribute in
  this project.
- `fetch("/api/status")` — **(a) first appearance.** `fetch` is a
  function built into every modern browser (not something we imported —
  it's part of the JavaScript environment a browser provides) that starts
  an HTTP request to the given path and immediately returns a **Promise**
  — an object representing "a value that isn't ready yet, but will be."
  Because `index.html` and `/api/status` are served by the *same* Flask
  app on the *same* origin (`127.0.0.1:5000`), this works with no extra
  configuration — a deliberate scope choice for this lesson, named
  explicitly: the moment the frontend becomes its own separate dev server
  in a later lesson, this exact request becomes **cross-origin**, and a
  browser security mechanism called CORS will block it until explicitly
  allowed. Not a problem yet; a real, named thing to expect later.
- `.then((response) => response.json())` — **(a) first appearance,** two
  new ideas: `.then(...)` is how you attach "do this once the Promise
  resolves" — Promises are the standard JavaScript way of sequencing
  work that depends on something slow (a network request) finishing
  first. `(response) => response.json()` is an **arrow function** — a
  more compact way to write `function (response) { return response.json(); }`.
  The part before `=>` is the parameter list (here, one parameter,
  `response`); the part after is the expression it returns. `response` is
  the raw HTTP response `fetch` received (status code, headers, and a body
  that hasn't been read yet); `.json()` is a method on it that reads the
  body and parses it from JSON text into a real JavaScript object — and,
  because that reading is itself slow, `.json()` *also* returns a Promise,
  which is exactly why a second `.then` is needed below rather than using
  the parsed data immediately.
- `.then((data) => { ... })` — same arrow-function and Promise-chaining
  concepts as above, **(c) reused, not re-explained**; `data` is now the
  actual parsed JavaScript object (matching the Python dict's shape:
  `{machine, status, position}`).
- `document.getElementById("status")` — **(a) first appearance.**
  `document` is a global object every browser provides, representing the
  currently-loaded page. `.getElementById("status")` searches the whole
  page for the one element whose `id` attribute matches (`status`, set in
  the HTML above) and returns it, or `null` if none exists.
- `.textContent = JSON.stringify(data, null, 2)` — two new ideas:
  `.textContent` is a property that, when *assigned to*, replaces an
  element's contents with plain text. **Named explicitly as a security
  choice, not just a convenience:** the alternative, `.innerHTML`, would
  instead parse whatever string it's given *as HTML* and could execute
  embedded `<script>` tags — the standard XSS (Cross-Site Scripting)
  attack vector. Today's data is our own hardcoded, trusted dict, so
  there's no real attacker here yet — but `.textContent` is the correct
  default habit to build now, before this project ever displays anything
  a user typed. `JSON.stringify(data, null, 2)` — **(a) first
  appearance** — is the reverse of `response.json()`: it converts a
  JavaScript object back into JSON text. Its three arguments: the value to
  convert; a "replacer" (here `null`, meaning "include everything,
  unfiltered" — a filtering function could be passed instead, not needed
  here); and `2`, the number of spaces to indent nested levels by, purely
  so a human reading the page sees nicely formatted, multi-line JSON
  instead of one long unbroken line.

### Project Change

- **Reference Source** — none; the reference app has its own, much
  richer real-time status display (`ChannelState`, per `CURRICULUM.md`),
  built on real machine data that doesn't exist yet in this project.
  This lesson's `fetch`/display is a from-scratch bootstrap specifically
  to prove the request/response loop end-to-end before anything real
  flows through it.
- **Files affected** — `cnc-service/templates/index.html` (modified —
  the `<script>` block added below the existing `<pre>`).
- **Change type** — add.
- **Location** — inside `<body>`, after the `<pre id="status">` element it
  refers to (the element must exist in the page before the script runs,
  since scripts execute top-to-bottom as the browser parses the page).
- **Dependencies** — the `/api/status` route from an earlier unit in this
  lesson; the `id="status"` element in the same file.

### CS Lens

The Promise/`.then` chain is **asynchronous programming** — starting an
operation that takes real time (a network round-trip) without *blocking*
everything else the browser is doing while it waits, and running a
callback only once the result actually arrives.

Also recognized in: literally every modern app that talks to a network
(every mobile app, every web app), event-driven UI frameworks generally,
and — a direct real-world echo of this exact project's subject matter — a
CNC controller issuing a motion command and continuing other work (reading
the next line, updating a display) while the axis is still physically
moving, rather than freezing until the move completes.

### SE Lens

Nothing here checks whether the request actually *succeeded* — `fetch`'s
Promise only rejects on a genuine network failure (server unreachable),
not on the server responding with an error status like `404` or `500`; a
broken server returning a `500` with an HTML error page would currently
have that HTML page's text silently stuffed into `<pre id="status">`,
looking like data. **Named, real, current debt** — not fixed in this
lesson on purpose, since fixing it well needs a concept (`response.ok`)
this bootstrap lesson doesn't need yet, and won't be silently forgotten:
it's written down here so a later lesson closes it deliberately, the same
way `CURRICULUM.md` names every other deferred gap.

### Commands and Real Output

No new terminal command — this unit's verification is the whole lesson's
Closing section, next.

---

## Connect the Pieces

One concrete trip through everything built in this lesson, start to
finish:

1. `.\.venv\Scripts\python.exe app.py` is run in a terminal. Python reads
   `app.py` top to bottom: imports Flask, creates `app`, registers `/` and
   `/api/status` in Flask's internal routing table, reaches
   `if __name__ == "__main__":`, sees this file *was* run directly, and
   calls `app.run(debug=True)` — which starts listening on
   `127.0.0.1:5000` and blocks.
2. A browser requests `http://127.0.0.1:5000/`. Flask's routing table
   matches `/` to `index()`, which calls `render_template("index.html")`,
   which reads `templates/index.html` from disk and returns its full text
   as the HTTP response body, with a `200` status.
3. As the browser parses that HTML, it reaches the `<script>` tag and runs
   it immediately: `fetch("/api/status")` starts a second, independent
   HTTP request, to the same server, and returns a pending Promise.
4. Flask's routing table matches `/api/status` to `get_status()`, which
   returns the `FAKE_MACHINE_STATUS` dict. Flask detects the dict, calls
   Python's `json` module internally, and sends back JSON text with
   `Content-Type: application/json` — verified for real:
   ```
   (Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/status" -UseBasicParsing).Headers["Content-Type"]
   application/json
   ```
5. The browser's `fetch` Promise resolves with that response. The first
   `.then` calls `.json()`, parsing the JSON text back into a real
   JavaScript object. The second `.then` receives that object as `data`,
   converts it back to nicely-indented text with `JSON.stringify`, and
   assigns it to `document.getElementById("status").textContent` —
   replacing "loading..." with the real (fake, but real-shaped) machine
   status, visible on the page with no reload.

Real, live confirmation of the exact HTML this loop produces, fetched
directly, this session:
```
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>cnc-service</title>
</head>
<body>
    <h1>Machine Status</h1>
    <pre id="status">loading...</pre>

    <script>
        fetch("/api/status")
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("status").textContent = JSON.stringify(data, null, 2);
            });
    </script>
</body>
</html>
```
(The static HTML always shows "loading..." — the fetch and DOM update only
happen once a real browser executes the `<script>`, which is why opening
this page in your own browser, per Definition of Done below, is part of
verifying this lesson, not optional.)

## What Breaks Without This

This lesson's entire point is "a server is a program that waits" — so the
realest possible failure is: stop the program, and see that nothing
answers anymore.

**Caused for real, this session:** the running server process was killed
outright, then a request was made against the exact same address:
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/status" -TimeoutSec 3

REAL FAILURE CAPTURED:
Unable to connect to the remote server
```
This is not Flask reporting an error — Flask isn't running at all anymore,
so there is nothing to answer with even a `404`. The failure happens one
whole layer lower, in the operating system's networking, which reports
that nothing is listening on port `5000` at all. This is the concrete
difference between "the server answered with an error" (which needs the
server to be running) and "the server doesn't exist right now" (which is
what actually happened here).

**Restored, verified again:**
```
.\.venv\Scripts\python.exe app.py   # started again, in the background
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/status"

machine    position               status
-------    --------               ------
mill-3axis @{x=0.0; y=0.0; z=0.0} idle
```
The server is running right now, at `http://127.0.0.1:5000` — open it in
your own browser as part of verifying this lesson yourself.

## Exercises

1. Change `FAKE_MACHINE_STATUS`'s `"status"` value from `"idle"` to
   `"running"`, save `app.py`. Because `debug=True` is set, Flask
   auto-restarts — refresh the browser page (no need to manually stop/
   start anything) and confirm the new value appears.
2. Add a third fake field to `FAKE_MACHINE_STATUS`, e.g.
   `"spindle_rpm": 0`. Refresh the browser and confirm it appears in the
   displayed JSON with no other code changes — proof that the frontend
   displays *whatever* the backend sends, rather than a fixed, hand-coded
   layout.
3. Visit `http://127.0.0.1:5000/nope` (a path with no matching route) in
   your browser. Read the real `404 Not Found` page Flask generates on
   its own, with no code written for it — this is Flask's built-in
   default behavior for any unmatched path, worth seeing once for real.

## Definition of Done

- [ ] `cnc-service/.venv/` exists and `cnc-service/requirements.txt` lists
      `Flask==3.1.3` and its dependencies.
- [ ] Running `.\.venv\Scripts\python.exe app.py` from inside
      `cnc-service/` starts a server with no errors, printing
      `Running on http://127.0.0.1:5000`.
- [ ] Opening `http://127.0.0.1:5000/` in your own browser shows "Machine
      Status" and, within a second, real JSON (not "loading...") showing
      `mill-3axis` / `idle` / `x: 0.0, y: 0.0, z: 0.0`.
- [ ] Requesting `http://127.0.0.1:5000/api/status` directly (browser
      address bar, or `Invoke-RestMethod`) returns the same data as raw
      JSON.
- [ ] You completed Exercises 1–3 above and observed the described real
      behavior yourself.
- [ ] A git commit exists for this lesson's code, with a message
      explaining *why* (a real backend now exists and answers real
      requests, replacing "nothing exists yet"), not just *what* files
      changed.
