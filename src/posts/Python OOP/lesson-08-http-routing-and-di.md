# Lesson 8: Answering Requests, Without Hardcoding Who Answers Them
### (Project 3 — Mini REST API, Python)

**What you will build.** A new project — a real HTTP server, using
nothing but Python's standard library, answering `GET /users` and
`POST /users` with real JSON responses, tested with genuine HTTP
requests, not simulated ones. The transferable problems this lesson is
actually about: routing one incoming request to the right piece of code
among many, and — the harder, more consequential problem — how a
request handler gets access to the *data* it needs to answer with,
without hardcoding exactly one specific source for that data forever.

**What you need to know first.** Project 1: `to_dict()`/JSON conversion
(Lesson 2), the Repository shape (Lesson 2). Project 2: a dispatch table
choosing behavior by name instead of an `if`/`elif` chain (Lesson 3's
CLI, echoed again here for URL paths instead of CLI subcommands).

---

## Concept Unit: A Minimal HTTP Server

### The Problem

Every project so far has run as a script you invoke once, do something,
and exit. A REST API is different in kind: it needs to sit there,
listening, and respond correctly to requests that arrive at unpredictable
times, from a real network connection — not from `sys.argv`, not from a
function call, but from an actual HTTP request sent over a socket.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `hello_server.py` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory, separate from
  Projects 1 and 2.
- **Dependencies** — `http.server`, part of the standard library — no
  installation needed, unlike `pytest` in Project 1.

### The New Code

```python
from http.server import BaseHTTPRequestHandler, HTTPServer


class HelloHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Hello, World!")


server = HTTPServer(("localhost", 8123), HelloHandler)
server.handle_request()
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

The code above *is* the isolated lab — there's no smaller version of "a
real server answering a real request" to build first. Run it, and, from
a separate process while it's listening, send it a genuine HTTP request:

```
$ python3 hello_server.py &
$ python3 -c "
import urllib.request
response = urllib.request.urlopen('http://localhost:8123/')
print(response.status)
print(response.read().decode())
"
```

Real output:

```
200
Hello, World!
```

That `200` and that exact text didn't come from calling a Python
function directly — they crossed a real network socket, from one
separate process to another, exactly the way a browser or `curl` would
talk to this same server. This proves `HTTPServer`/`BaseHTTPRequestHandler`
genuinely handle the low-level mechanics of speaking HTTP — parsing the
incoming request line, writing a correctly formatted response — so that
`do_GET` only has to decide *what* to answer, never *how* to speak the
protocol itself.

### Discard the throwaway example

`hello_server.py` and its fixed `"Hello, World!"` response are deleted
— it only existed to prove a server can be started and answer a real
request at all, before anything about paths, methods, or data enters
the picture.

### Mechanical walkthrough

- `from http.server import BaseHTTPRequestHandler, HTTPServer` — **(b)
  hard concept reappearing**, `import` from Lesson 2, from a new
  standard-library module.
- `class HelloHandler(BaseHTTPRequestHandler):` — **(a) first
  appearance** of **inheritance**: `HelloHandler` isn't built from
  scratch — it starts as a full copy of everything `BaseHTTPRequestHandler`
  already knows how to do (parsing requests, writing valid HTTP
  responses), and only adds or overrides the specific pieces that need
  to differ, which here is just `do_GET`.
- `def do_GET(self):` — **(a) first appearance.** This exact method
  name is what `BaseHTTPRequestHandler` looks for and calls
  automatically whenever a `GET` request arrives — nothing calls
  `do_GET` directly; the parent class does, the same automatic-dispatch
  idea `__init__` demonstrated back in Lesson 1, applied to HTTP methods
  instead of object construction.
- `self.send_response(200)` — **(a) first appearance.** Writes the
  first line of a real HTTP response, including status code `200`
  (meaning "success") — a number the client, `urllib` here, reads and
  reports back as `response.status`.
- `self.end_headers()` — **(a) first appearance.** Signals "no more
  header lines are coming; here comes the actual response body."
- `self.wfile.write(b"Hello, World!")` — **(a) first appearance** of a
  **bytes literal** (`b"..."`): HTTP responses are sent as raw bytes,
  not Python strings, so the text has to be explicitly marked as bytes
  before being written to `self.wfile`, the outgoing connection.
- `server = HTTPServer(("localhost", 8123), HelloHandler)` — **(a)
  first appearance.** Builds a real server bound to `localhost` on port
  `8123`, configured to hand every incoming request to a fresh
  `HelloHandler` instance.
- `server.handle_request()` — **(a) first appearance.** Waits for
  exactly one request, handles it, and returns — used here only to keep
  this throwaway example simple; the real project needs something that
  keeps listening indefinitely, which the next unit introduces.

### CS lens

This is the **client-server model**: two separate, independently
running programs — here, `hello_server.py` and the `urllib` script —
communicating over a network protocol, HTTP, rather than through direct
function calls in the same process. Also recognized in: literally every
website you've ever visited, a mobile app talking to its backend, one
microservice calling another inside a larger system.

### SE lens

There's no real alternative being rejected here — `http.server` is the
standard library's own answer to "I need to speak HTTP," and using it
directly, rather than reaching for a third-party framework immediately,
keeps this first unit honest about what's actually happening at the
protocol level before any convenience layer hides it. The real tradeoff,
worth naming now: `http.server` is explicitly documented as not
hardened for production traffic — fine for learning and small internal
tools, not what a real public-facing API would ship on. That's a
genuine limit, not a simplification pretending otherwise.

### Commands needed

`python3 hello_server.py &` runs the server in the background so the
terminal is free to send it a request immediately after; the trailing
`&` is shell syntax, not Python.

### Run it

Shown above — `200`, `Hello, World!`, over a real socket.

### Connecting sentence

A real server can now answer exactly one, fixed request — the next unit
makes it answer *different* requests differently, based on what was
actually asked for.

---

## Concept Unit: Routing

### The Problem

A real API needs more than one URL to mean something — `GET /` might
mean "show API info," `GET /status` might mean "are you alive," and
soon, `GET /users` will mean something else again. `do_GET` needs to
look at *which* path was requested and behave differently for each one,
without turning into an ever-growing pile of `if self.path == "/x":
... elif self.path == "/y": ...` — the exact problem Lesson 3's CLI
already solved once, for subcommands instead of URL paths.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `routing_server.py` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — same as the previous unit.

### The New Code

```python
def handle_root(handler):
    handler.send_response(200)
    handler.end_headers()
    handler.wfile.write(b"Welcome to the API root")


def handle_status(handler):
    handler.send_response(200)
    handler.end_headers()
    handler.wfile.write(b"OK")


ROUTES = {
    "/": handle_root,
    "/status": handle_status,
}


class RoutingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        route = ROUTES.get(self.path)
        if route:
            route(self)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

No separate lab needed — `ROUTES`, a dictionary mapping a name to a
function, is exactly `SORT_STRATEGIES` from Lesson 3, already proven
there in full: a dictionary whose values are callable functions, looked
up by a runtime value instead of hardcoded into a branch. This unit is
applying that already-earned idea to URL paths instead of `--sort`
values, shown directly in the real code above.

### Discard the throwaway example

Not applicable here — `routing_server.py` is this unit's own
demonstration, run below, and will itself be discarded once the real
project's server absorbs this shape in the next unit.

### Mechanical walkthrough

- `def handle_root(handler):` / `def handle_status(handler):` — **(a)
  first appearance** of the specific shape: a plain function, not a
  method, that takes the *handler instance* itself as a parameter, so
  it can call `send_response`/`end_headers`/`wfile.write` on it — a
  route function has to reach back into the handler to actually respond.
- `ROUTES = {"/": handle_root, "/status": handle_status}` — **(b) hard
  concept reappearing**, `SORT_STRATEGIES`'s exact shape from Lesson 3.
- `route = ROUTES.get(self.path)` — **(a) first appearance** of
  `.get()` on a dict: unlike `[]` indexing (used for `SORT_STRATEGIES[args.sort]`
  in Lesson 3, which crashes on a missing key), `.get()` returns `None`
  — Lesson 6's `None` — if the key isn't present, instead of raising an
  error. That distinction matters here specifically: an unknown URL
  path is an expected, ordinary situation an API has to handle
  gracefully, not a bug to crash on.
- `if route: route(self)` — **(b) hard concept reappearing**: the same
  "look up a function by key, then call it" pattern from
  `SORT_STRATEGIES[args.sort]` followed by `sorted(notes, key=strategy)`
  in Lesson 3 — here calling the looked-up function directly instead of
  passing it to something else.
- `self.send_response(404)` — **(b) hard concept reappearing**, same
  method as `200` in the previous unit, a different status code meaning
  "not found."

### CS lens

`ROUTES` is a **routing table**: the same dispatch-by-lookup idea from
Lesson 3, applied to the specific, extremely common case of "which URL
path maps to which behavior." Also recognized in: literally every web
framework's own router (Flask's `@app.route`, Django's `urls.py`,
Express's `app.get(...)`) — all of them are, underneath their own
syntax, a lookup table exactly like `ROUTES` here.

### SE lens

The alternative — `if self.path == "/": ... elif self.path == "/status":
...` inside `do_GET` — is the same anti-pattern Lesson 3 already
rejected once for CLI subcommands, showing up again in a new place for
the identical reason: every new route would mean editing `do_GET`
itself and growing that chain forever. `ROUTES` costs one dictionary;
adding a new route means adding one function and one dictionary entry,
with `do_GET` itself never touched again.

### Commands needed

Same pattern as the previous unit — run the server, issue requests
against it separately.

### Run it

```
$ python3 routing_server.py
/ -> 200 Welcome to the API root
/status -> 200 OK
/nonexistent -> 404 Not Found
```

(This run starts the server on a background thread and fires three real
requests at it from the same script, printing each result — the pattern
the rest of this lesson reuses.)

### Connecting sentence

Different paths now genuinely produce different, correct responses —
what's still missing is any *real* data behind those responses; every
route function so far returns fixed, hardcoded text.

---

## Concept Unit: Injecting the Dependency

### The Problem

`GET /users` needs to return an actual, changeable list of users — not
a hardcoded string. The obvious next move is a route function that
creates a `UserRepository` (Project 1's Repository shape, reused for a
new kind of data) and reads from it directly. But `BaseHTTPRequestHandler`
subclasses are instantiated *automatically*, once per incoming request,
by `HTTPServer` itself — there's no line of code in this project that
calls `UserHandler(...)` directly, which means there's no obvious place
to pass a specific `UserRepository` instance in through a normal
constructor call the way `NoteRepository("notes.json")` worked back in
Project 1.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `closure_lab.py` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```python
def make_greeter(greeting):
    def greet(name):
        return f"{greeting}, {name}!"
    return greet


hello_greeter = make_greeter("Hello")
howdy_greeter = make_greeter("Howdy")

print(hello_greeter("Ada"))
print(howdy_greeter("Ada"))
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Run it:

```
Hello, Ada!
Howdy, Ada!
```

`greet` is defined *inside* `make_greeter`, and yet, after
`make_greeter` has already finished running and returned, calling
`hello_greeter("Ada")` still remembers `greeting` was `"Hello"` for that
particular one, while `howdy_greeter` separately remembers `"Howdy"` —
two independent functions, each carrying its own private copy of
whatever value was passed to `make_greeter` when it was built. This is
called a **closure**: an inner function that captures a variable from
its enclosing function's scope and keeps access to it, even after the
enclosing function has returned.

### Discard the throwaway example

`make_greeter`/`greet` are deleted — they only existed to prove an inner
function can remember a value from outside itself, isolated from
`HTTPServer` and `UserRepository` entirely. The real project applies
this same idea one level up: instead of a function that remembers a
greeting, a function that builds an entire *handler class* that
remembers a repository.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `user_repository.py`, `api.py`.
- **Change type** — add.
- **Location** — new files, alongside `routing_server.py`'s successor.
- **Dependencies** — `json`, Lesson 2; `http.server`, this lesson's
  first unit.

### The New Code

```python
class UserRepository:
    def __init__(self):
        self.users = []

    def add(self, name):
        user = {"id": len(self.users) + 1, "name": name}
        self.users.append(user)
        return user

    def all(self):
        return self.users
```

```python
def make_handler(repo):
    class UserHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/users":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(repo.all()).encode())
            else:
                self.send_response(404)
                self.end_headers()

        def do_POST(self):
            if self.path == "/users":
                length = int(self.headers["Content-Length"])
                body = json.loads(self.rfile.read(length))
                user = repo.add(body["name"])
                self.send_response(201)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(user).encode())
            else:
                self.send_response(404)
                self.end_headers()

    return UserHandler
```

### The Updated Project

Both files shown whole above — `make_handler` is the connective piece:
it takes a `repo` as a plain argument (the way any function would), and
*returns* a full handler class that every method inside it can reach
`repo` from, via the closure the previous lab just proved works.

### Mechanical walkthrough

- `class UserRepository:` through `def all(self): return self.users` —
  **(b) hard concept reappearing**, the exact `NoteRepository` shape
  from Project 1 Lesson 2 — a list, an `add` method, a way to read
  everything back — applied to users instead of notes.
- `def make_handler(repo):` — **(a) first appearance** of a
  **factory function returning a class**: unlike `make_greeter`, which
  returned another function, `make_handler` returns an entire *class
  definition*, built fresh, specific to whichever `repo` was passed in.
- `class UserHandler(BaseHTTPRequestHandler):` defined *inside*
  `make_handler` — **(a) first appearance.** Because this class is
  defined inside the function, every method inside it can read `repo`
  directly, the exact same closure mechanism the isolated lab proved —
  `repo` isn't a global, isn't passed to `__init__` explicitly; it's
  simply in scope.
- `if self.path == "/users":` — **(b) hard concept reappearing**, the
  path check from the previous unit's `do_GET`, here written directly
  rather than through `ROUTES` (a single route doesn't need a full
  table yet — a genuine, honest simplification, not a regression).
- `self.send_header("Content-Type", "application/json")` — **(a) first
  appearance** of a response header beyond the status line: tells
  whatever's reading the response — a browser, `urllib`, another
  program — that the body is JSON text, not plain text or HTML.
- `json.dumps(repo.all()).encode()` — **(b) hard concept reappearing**:
  `json.dumps` mirrors `json.dump` from Project 1 Lesson 2 (`dumps`
  returns a string; `dump` writes directly to a file) — `.encode()`
  turns that string into bytes, the same requirement `b"Hello, World!"`
  demonstrated directly as a literal in this lesson's first unit.
- `def do_POST(self):` — **(a) first appearance** of a second HTTP
  method handled on the same handler: `BaseHTTPRequestHandler` looks for
  `do_POST` for `POST` requests exactly the way it looked for `do_GET`.
- `length = int(self.headers["Content-Length"])` — **(a) first
  appearance**: an HTTP request that includes a body reports its size
  up front in the `Content-Length` header, as a string, so it needs
  converting to an `int` before it can be used to know how many bytes
  to read.
- `body = json.loads(self.rfile.read(length))` — **(a) first
  appearance** of `self.rfile.read(length)`: reads exactly that many
  bytes from the incoming request — the request body the client sent.
  `json.loads` — **(b) hard concept reappearing**, `json.load`'s
  string-based counterpart, mirroring `dumps`/`dump`'s own pairing.
- `user = repo.add(body["name"])` — **(b) hard concept reappearing**,
  dict indexing from Project 1 Lesson 2, pulling the `"name"` field out
  of the parsed request body.
- `self.send_response(201)` — **(a) first appearance** of status `201`
  specifically: HTTP's convention for "a new resource was successfully
  created," distinct from `200`'s plain "success."
- `return UserHandler` — **(c) already basic**, a plain `return`.

### CS lens

This is **Dependency Injection**: `UserHandler` needs a `UserRepository`
to do its job, but it never constructs one itself — it's handed one from
outside, by whoever calls `make_handler(repo)`. Also recognized in:
Flask's or FastAPI's own dependency-injection systems for database
connections, Java/C# frameworks like Spring or ASP.NET Core where DI is
a first-class, built-in mechanism (with far more ceremony than a
Python closure — the same pattern, shaped very differently by what each
language makes easy), a game engine handing a specific asset loader
into a level instead of every level hardcoding its own.

### SE lens

The alternative — `UserHandler` creating its own `UserRepository()`
directly inside itself, or reaching for one sitting in a global variable
— would work for exactly one running server with exactly one shared
data source. It breaks down the moment two different needs diverge:
testing (where a test wants a fresh, empty, disposable repository every
time — Lesson 4's `tmp_path` problem, one level up) or running two
independent API instances side by side. `make_handler(repo)` costs one
level of function nesting; in exchange, the exact same `UserHandler`
class shape can be pointed at *any* repository — real, empty, or
pre-populated with test data — decided entirely by whoever calls
`make_handler`, with zero changes to `UserHandler` itself. Proof, not
just assertion: two independent servers, built from the same
`make_handler` factory but given two separate `UserRepository`
instances, stay completely isolated from each other — shown in this
unit's Run It section below.

### Commands needed

Same server-plus-request pattern as the previous units.

### Run it

```python
repo = UserRepository()
Handler = make_handler(repo)
server = HTTPServer(("localhost", 8125), Handler)
# ... server started on a background thread ...

# GET /users on an empty repository
GET /users (empty): 200 []

# POST /users to add a new user
POST /users: 201 {"id": 1, "name": "Ada"}
POST /users: 201 {"id": 2, "name": "Grace"}

# GET /users again
GET /users (after adds): 200 [{"id": 1, "name": "Ada"}, {"id": 2, "name": "Grace"}]
```

And the isolation proof, two servers built from the same factory with
two separate repositories:

```python
repo_a = UserRepository()
repo_b = UserRepository()
server_a = HTTPServer(("localhost", 8126), make_handler(repo_a))
server_b = HTTPServer(("localhost", 8127), make_handler(repo_b))
# ... POST "Only in A" to server_a only ...
```

```
Server A users: [{"id": 1, "name": "Only in A"}]
Server B users: []
```

`server_b`, built from the exact same `UserHandler` shape, has no idea
`repo_a` even exists — proving the injected dependency, not the class
itself, is what determines which data a given server actually serves.

### Connecting sentence

The API now genuinely creates and returns real data over real HTTP —
and it does so with the specific data source fully decoupled from the
handler logic, which is what made testing two independent copies of the
same server possible with zero duplicated code.

---

## Closing

**Connect the pieces.** One request, start to finish: a client sends
`POST /users` with a JSON body `{"name": "Ada"}`; `do_POST` reads
`Content-Length`, reads exactly that many bytes from `self.rfile`, and
parses them with `json.loads` into `body`; `repo.add(body["name"])`
appends a new user dict to whichever `UserRepository` was closed over by
`make_handler` when this specific server was built, and returns it;
`json.dumps(user).encode()` turns that dict back into JSON bytes,
written to `self.wfile` as the response body, alongside status `201`.
A later `GET /users` on the *same* server reads from that *same*
`repo.users` list and returns it — proving the data genuinely persisted
across two entirely separate HTTP requests, in memory, for as long as
this one server process keeps running.

**What breaks without this.** Send a `POST /users` body missing the
expected `"name"` key — `{"nickname": "Ada"}` instead:

```
Exception occurred during processing of request from ('127.0.0.1', 46236)
Traceback (most recent call last):
  ...
  File "api.py", line 21, in do_POST
    user = repo.add(body["name"])
                    ~~~~^^^^^^^^
KeyError: 'name'
```

The server logs a full traceback on its own side, and the client — the
`urllib` script that sent the malformed request — gets nothing back at
all: the connection simply closes, and `urlopen` raises
`http.client.RemoteDisconnected` rather than any kind of clean HTTP
error status. That's a real, honest gap: this handler currently trusts
every request body to already be correctly shaped, exactly the kind of
unchecked assumption Lesson 3's `argparse` handled automatically for CLI
arguments, with a proper 400-style error instead of a crash. Nothing in
`http.server` gives that validation for free the way `argparse` did —
it has to be written by hand, and this lesson deliberately hasn't
written it yet.

**Exercises.**
1. Fix the crash above: check whether `"name"` is present in `body`
   before calling `repo.add(...)`, and if it's missing, send back
   `self.send_response(400)` with a JSON error body instead of letting
   the `KeyError` propagate.
2. Add a `GET /users/<id>` route — you'll need to check whether
   `self.path` starts with `"/users/"` and pull the id out of the rest
   of the string, since `ROUTES`'s exact-match lookup from this lesson's
   second unit can't handle a path with a variable piece in it.
3. Write a `pytest` test (Lesson 4) that builds a `UserRepository`
   directly — no HTTP, no server — and asserts `add()` followed by
   `all()` returns the expected list, entirely independent of anything
   this lesson built around `http.server`.

**Definition of done.**
- [ ] A real server answers `GET /users` and `POST /users` over actual
      HTTP, confirmed with real `urllib` requests and real JSON
      responses matching what's shown above.
- [ ] You've proven, with two separate running servers, that injecting
      different `UserRepository` instances through `make_handler` keeps
      their data fully isolated.
- [ ] You've triggered the real server-side crash from a malformed POST
      body, read the traceback, and understand exactly which line
      failed and why.
- [ ] Commit with a message explaining why — e.g. `"Inject UserRepository
      into the handler factory instead of hardcoding it, so the same
      handler class can serve isolated data sources"` — not `"add users
      API"`.

**Next lesson** stays in Project 3: real input validation (fixing this
lesson's own named gap), the `Adapter` pattern once a second, differently-
shaped data source needs to look like a `UserRepository` to the rest of
the API, and — finally — the hash-based index that turns `find_by_title`'s
Project 2 linear scan into something that scales to the "50,000 users"
this project's data is now shaped to actually hold.
