# Lesson 0a: A Server That Can Say Something

**What you will build:** A Flask application that starts a real local
web server and returns a raw HTML string to a browser (or `curl`) that
requests it. No components, no Python objects representing UI yet — just
one function, one route, one string. The transferable problem this
lesson is actually about: every later lesson's "patch" has to travel
from a Python process to a browser somehow. Before diffing or virtual
DOMs mean anything, you need one real string making that trip, reliably,
end to end.

**What you need to know first:** Nothing — this is the first lesson in
the sequence.

---

## Concept Unit: The Flask Application Object

### The Problem

Right now, nothing in Python represents "a running web server." We need
some object that Flask can use as the central thing everything else —
routes, configuration, the eventual dev server — gets attached to.

### Introduce the Concept in Isolation

```python
from flask import Flask

app = Flask(__name__)
print(type(app))
```

Run:

```
<class 'flask.app.Flask'>
```

This proves `Flask(__name__)` doesn't just configure something — it
constructs and returns a real object, an instance of `flask.app.Flask`,
that we can hold onto and pass around. This is called the **Flask
application object**.

### Discard

`throwaway1.py` is deleted. It never appears in the project again — its
only job was proving that `Flask(__name__)` produces a real, holdable
object.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition, not a port of an existing library's internals.
- **Files affected:** `app.py` (new)
- **Change type:** add
- **Location:** n/a — this is the first content of a brand-new file
- **Dependencies:** the `flask` package installed (`pip install flask`)

### The New Code — type it yourself

```python
from flask import Flask

app = Flask(__name__)
```

### The Updated Project

Skipped for this unit — the code above *is* the entire new structure so
far, with nothing surrounding it yet (Project Change already covers
this: a brand-new file has nothing to locate a position within).

### Mechanical Walkthrough

- `from flask import Flask` — **(a) first appearance.** Pulls the
  `Flask` class out of the installed `flask` package so it's usable by
  name in this file.
- `Flask(__name__)` — **(a) first appearance.** Calling the `Flask`
  class constructs the application object — the thing every route,
  every piece of configuration, and eventually the dev server itself
  will be registered against or launched from.
- `__name__` — **(a) first appearance, in this specific role.** You may
  already know `__name__` as a string Python fills in automatically for
  every module. Here it's being *passed to* Flask specifically so Flask
  can figure out your file's location on disk — it uses that to know
  where to look for things like templates and static files later. We
  aren't using either of those yet, but the constructor needs it now to
  set up correctly.
- `app = ...` — a plain variable assignment. Already-established basic
  syntax — no restatement owed.

### SE Lens

Flask uses one shared application object rather than, say, letting you
register routes with no central object at all (some minimal frameworks
work that way, dispatching purely off a manually-maintained dictionary).
The tradeoff: a single object to register everything against means every
route in the file can find it by referring to the same `app` name — no
wiring required. The cost is that `app` becomes global, module-level
state; two independent Flask apps trying to share one `app.py` would
collide. For a single small app, that cost doesn't bite yet.

### Commands Needed

```
pip install flask
```

`pip` is Python's package installer; this downloads and installs the
`flask` package (and its dependencies) into your environment. Verify it
worked:

```
python3 -c "import flask; print(flask.__version__)"
```

Success looks like a version string printed with no errors (this
project is using `3.1.3`).

### Run It

Can't run standalone yet — `app` exists, but nothing has told it what to
do when a browser actually requests something. That's the next unit.

### Connect

This `app` object is what every future route, and eventually the dev
server itself, will attach to.

---

## Concept Unit: Registering a Route with a Decorator

### The Problem

`app` exists, but it has no idea what to do if a browser asks for `/`.
We need a way to say "when someone requests this specific URL path, run
this specific function."

### Introduce the Concept in Isolation

```python
def announce(name):
    def wrapper(func):
        print(f"registered: {name}")
        return func
    return wrapper

@announce("greet")
def greet():
    return "hi"

print("script finished, greet() not called yet")
```

Run:

```
registered: greet
script finished, greet() not called yet
```

Notice `"registered: greet"` printed *before* `"script finished"` —
even though `greet()` itself was never called anywhere in this file.
This proves the code sitting inside the decorator runs immediately, at
the moment the function is *defined*, not later when it's *called*.
This is called a **decorator**.

### Discard

`throwaway2.py` is deleted. `announce` was never a real concept in this
project — it existed only to prove decorators fire at definition time,
which is exactly what `@app.route(...)` is about to do for real.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** add
- **Location:** directly below the `app = Flask(__name__)` line added in
  the previous unit
- **Dependencies:** none beyond the previous unit

### The New Code — type it yourself

```python
@app.route("/")
def index():
    return "<h1>Hello from Flask</h1>"
```

### The Updated Project

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")                          # ← new
def index():                              # ← new
    return "<h1>Hello from Flask</h1>"    # ← new
```

`app.py` now does two things as a whole: it builds the Flask application
object, and it registers exactly one URL path (`/`) against exactly one
function (`index`). It still doesn't run — that's the next unit.

### Mechanical Walkthrough

- `@app.route("/")` — **(a) first appearance.** `app.route` is a method
  on the Flask application object. Calling it with `"/"` and applying it
  as a decorator to `index` — exactly the pattern just proven in the
  lab above — registers `"/"` in Flask's internal routing table, mapped
  to `index`. This is why it has to run *before* the server starts:
  registration happens at decoration time, at import time, not per
  request.
- `def index():` — a plain function definition. Already-established
  basic syntax — no restatement owed.
- `return "<h1>Hello from Flask</h1>"` — **(a) first appearance.**
  Whatever string a Flask view function returns becomes the literal body
  of the HTTP response Flask sends back. No response object needs to be
  built by hand for something this simple — Flask does that wrapping for
  you.

### CS Lens

Registering a URL string against a function, ahead of time, so a later
lookup can jump straight to the right code — this is a **dispatch
table** (a routing table). Also recognized in: every web framework's URL
router, `switch`/pattern-match statements a compiler turns into jump
tables, OS interrupt vector tables, and — worth remembering for later in
this project — the event-listener registries GUI frameworks use to map
a click on a specific element to a specific handler function.

### SE Lens

The alternative not chosen here is a single large `if/elif` chain
checking `request.path == "/"`, `== "/about"`, and so on, all living in
one place. The tradeoff: decorator-based registration keeps a route's
definition physically next to the function that handles it (locality —
add a new page by adding a new function, not by editing a shared
dispatcher). The real cost: you can no longer read `app.py` top to
bottom and see every route listed in one spot — you have to trust that
`@app.route` is quietly building that table for you as the file loads.

### Run It

Still can't run standalone — nothing has started the actual server
process yet. Connects to the next unit.

### Connect

`index` is now the function that will run the moment this route
actually receives a request — which needs a running server, next.

---

## Concept Unit: The `__main__` Guard and Starting the Server

### The Problem

A Python file can be *run directly* (`python3 app.py`) or *imported* by
some other file (`import app`). We don't want a real server to start up
just because something else imported `app.py` — for example, to reuse
one of its functions in a test file later. We need the server to start
only when this file is the one being run directly.

### Introduce the Concept in Isolation

```python
print("module executed, __name__ =", __name__)
```

Run directly:

```
$ python3 throwaway3.py
module executed, __name__ = __main__
```

Run via import instead:

```
$ python3 -c "import throwaway3"
module executed, __name__ = throwaway3
```

Same file, same line of code, two different values for `__name__` —
`"__main__"` when run directly, the file's own name when imported. This
proves `__name__` genuinely changes based on *how* the file was
started, which is exactly what a guard condition needs to key off of.

### Discard

`throwaway3.py` is deleted.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** add
- **Location:** at the bottom of the file, after the `index` function
  added in the previous unit
- **Dependencies:** none beyond the previous units

### The New Code — type it yourself

```python
if __name__ == "__main__":
    app.run(debug=True)
```

### The Updated Project

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "<h1>Hello from Flask</h1>"

if __name__ == "__main__":    # ← new
    app.run(debug=True)        # ← new
```

`app.py` is now a complete, runnable file: it builds the application
object, registers one route, and — only when run directly — starts a
real server listening for requests against that route.

### Mechanical Walkthrough

- `if __name__ == "__main__":` — **(a) first appearance.** Using the
  fact just proven in the lab above: this condition is only `True` when
  `app.py` is executed directly, not when some other file imports it.
  Everything indented under it is skipped entirely on import.
- `app.run(debug=True)` — **(a) first appearance.** `.run()` starts
  Flask's built-in development server — a real process that binds to a
  local network port (5000 by default) and blocks, listening for actual
  HTTP connections, until you stop it.
- `debug=True` — **(a) first appearance.** Turns on Flask's debug mode:
  the server auto-restarts when it detects a file change, and errors
  show a detailed in-browser traceback instead of a bare failure page.
  Never used in a real deployment — but this project isn't deployed
  anywhere yet, so the tradeoff is free for now.

### CS Lens

Guarding "did I get run directly, or was I imported" is the **entry
point** pattern. Also recognized in: C and C++'s `main()` function,
Java's `public static void main`, and the general module-vs-script
duality most scripting languages have to solve somehow.

### SE Lens

The alternative is no guard at all — `app.run()` sitting at the top
level of the file, unconditionally. The tradeoff: without the guard,
merely *importing* `app.py` from anywhere (a test file, a REPL session,
a future file that wants to reuse `index()`) would immediately try to
start a real server and block. The guard costs one `if` line and one
indent level; skipping it costs the file its ability to ever be safely
imported.

### Commands Needed

```
python3 app.py
```

Success looks like Flask's startup banner:

```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

### Run It

With the server running, a real request against it:

```
$ curl -s http://127.0.0.1:5000/
<h1>Hello from Flask</h1>
```

That's `index()`'s actual return value, unchanged, delivered by a real
HTTP response.

### Connect

The loop is closed: a string written inside a Python function is now
something a browser can actually receive.

---

## Closing

### Connect the Pieces

Trace `"<h1>Hello from Flask</h1>"` end to end:

1. Written as `index()`'s return value (Concept Unit 2).
2. `index` is only reachable because `@app.route("/")` registered it in
   Flask's routing table against the path `"/"` (Concept Unit 2), which
   only happened because `app` existed for `.route` to be called on
   (Concept Unit 1).
3. A real request arrives because `app.run(debug=True)` (Concept Unit 3)
   started an actual server process bound to a port — and it only
   started because this file was run directly, not imported (the
   `__main__` guard, also Concept Unit 3).
4. Flask matches the incoming request's path against the routing table,
   calls `index()`, takes its return value, and wraps it into a real
   HTTP response — which `curl` then printed.

### What Breaks Without This

With the `@app.route("/")` decorator removed (leaving `index` defined
but unregistered), starting the server and requesting `/` produces a
real 404:

```
$ curl -s -i http://127.0.0.1:5001/
HTTP/1.1 404 NOT FOUND
...
<h1>Not Found</h1>
<p>The requested URL was not found on the server. If you entered the URL
manually please check your spelling and try again.</p>
```

Nothing crashes — Flask has no idea `"/"` should mean anything at all
without that decorator having run. Restoring the decorator restores the
route.

### Exercises

- Add a second route, `/about`, returning different HTML, and visit both
  in a browser.
- Change the string `index()` returns and confirm (via `curl` or a
  browser) that the change shows up without touching anything else in
  the file.

### Definition of Done

- [ ] `pip install flask` succeeds and `import flask` works.
- [ ] `python3 app.py` starts without errors and prints the startup
      banner.
- [ ] `curl http://127.0.0.1:5000/` returns the real HTML string.
- [ ] Removing `@app.route("/")` and re-requesting `/` produces a real
      404 (then the decorator is restored).
- [ ] Committed with a message explaining *why*: something like
      `"Add smallest possible Flask slice: one route, one server, to
      establish the request/response path every later lesson's patches
      will travel over"` — not `"add app.py"`.
