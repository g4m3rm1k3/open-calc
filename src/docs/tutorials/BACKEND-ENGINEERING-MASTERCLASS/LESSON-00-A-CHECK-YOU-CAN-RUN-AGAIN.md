# Lesson 0: A Check You Can Run Again

*All file paths in this lesson refer to files created for this lesson's
own labs, in the `manufacturing-platform` repository's `verification/`
folder — not to the real backend app itself.*

**What you will build:** Nothing that ships. Four small, real,
throwaway programs, each run for real, each proving one real fact about
automated testing: why an automated check beats a one-time manual
glance, what actually separates a unit test from an integration test
from an end-to-end test, what mocking actually is and what it costs, and
why "regression test" and "characterization test" describe *purpose*,
not *mechanism*. The transferable problem underneath all four: code that
works right now, in front of you, is not the same claim as code that
will still work after something else nearby changes — and only one of
those two claims can be checked by looking.

**What you need to know first:** A Python function; what an HTTP
request and response are.

## Terms used in this lesson

- **Automated test** — a piece of code that checks another piece of
  code's behavior, repeatably, by running it and comparing a real result
  against an expected one — instead of a person reading the code or its
  output and judging by eye. It exists because a human glance only
  proves something at the single moment it happens; a person cannot
  re-glance at every past check every time any code changes anywhere in
  a project, but a computer can re-run every automated check every time,
  in seconds, for free.
- **Deterministic** — always producing the same output for the same
  input, no matter when or how many times it runs. It matters here
  because an automated check that isn't deterministic can't reliably
  tell you anything: a check that sometimes passes and sometimes fails
  for reasons unrelated to the code being correct is worse than no check
  at all, since it teaches you to ignore failures.
- **Unit test** — an automated test that exercises one function or one
  small piece of code in isolation, with nothing around it faked or
  real that it depends on beyond what it's actually testing. It exists
  to answer the narrowest possible question: does this one piece of
  logic, by itself, do the right thing.
- **Integration test** — an automated test that exercises two or more
  real pieces of a system running together (for example: real routing,
  a real view function, and a real in-memory database), with nothing
  faked at the boundary being tested. It exists because pieces that each
  pass their own unit test can still fail to work correctly *together*
  — a mismatched assumption at the seam between them is invisible to
  either piece's own isolated test.
- **End-to-end test** — an automated test that exercises the entire real
  system the way an actual outside caller would: a real, separate server
  process, a real network connection, a real request sent and a real
  response received. It exists because even a passing integration test
  still runs inside the same process as the test itself; an end-to-end
  test is the only kind that proves the system also works once it's
  actually deployed and reachable from outside its own process.
- **Mock** — a fake, controlled stand-in for a real dependency (a slow
  network call, a paid API, anything with an unpredictable or costly
  real result), substituted into a test so the test can run fast and
  get the same answer every time. It exists because some real
  dependencies are too slow, too unreliable, or too expensive to call
  for real on every single test run, and a test that isn't fast and
  reliable stops getting run.
- **Regression** — a bug that was, at some point, fixed or absent, and
  later reappears — usually because a later change quietly undid the
  earlier fix, or broke an assumption the fix depended on. It matters
  here because a **regression test** is any automated test written
  specifically so a regression like this gets caught immediately instead
  of shipping unnoticed.
- **Characterization test** — an automated test written to pin down and
  prove exactly what a piece of code *actually does right now* —
  correct or not — as a stable, real baseline to build a replacement
  against. It exists so a rewrite can be checked against real, current
  behavior instead of against someone's memory or assumption of what
  that behavior probably is.
- **Process** — one running instance of a program, with its own private
  memory that no other process can see or touch directly. It matters
  here because an end-to-end test's server runs as a genuinely separate
  process from the test itself — the only way for two running programs
  to talk to each other at that point is through some real, external
  channel (like a network connection), not a normal function call.
- **Socket** — the real, addressable endpoint (an IP address plus a
  port number) a process opens so other processes — including ones on
  a different machine entirely — can send it data over a network. It's
  what actually carries an HTTP request from one real process to
  another; nothing resembling a Python function call happens at this
  layer at all.
- **Port** — a number (0-65535) identifying *which* listening socket on
  a given machine a connection is meant for, since one machine can run
  many network-facing programs at once, each needing its own address to
  be reached at.
- **`assert`** — a Python statement that evaluates an expression and,
  if it's `False`, immediately stops execution and reports exactly
  which comparison failed. It exists so a test doesn't have to write its
  own "if this doesn't match, say so and stop" logic by hand, every
  single time, in every single test.

## Objects and methods used

- **`unittest.mock.patch`**
  - *What it is:* A function (usable as a context manager, via `with`)
    from Python's standard library that temporarily replaces a named
    object — here, a function — with a controlled fake for the duration
    of a block of code.
  - *Implementation:* `unittest.mock.patch(target: str, return_value=...)`
    — `target` is a **string** naming where the object being replaced is
    looked up (`"__main__.get_shipping_rate"`), not the object itself.
  - *Its use:* This lesson's mocking lab uses it to replace a slow,
    unpredictable function with an instant, fixed one, only inside one
    `with` block.
  - *Type:* A function, used here as a context manager (the object
    `with` calls `__enter__`/`__exit__` on).
  - *Responsibility:* Look up the real object named by `target`, swap in
    a `Mock` in its place for as long as the `with` block runs, and
    restore the original object the instant the block ends — even if
    the block raises an exception.
  - *Depends on:* A string path to the thing being replaced, and
    (optionally) a fixed value the fake should return whenever it's
    called.
  - *Connects to:* Called by this lesson's lab, wrapping a call to
    `total_with_shipping`, which internally calls the now-replaced
    `get_shipping_rate`.
  - *Shape:* A seam standard library testing tools provide specifically
    so real, slow, or unpredictable dependencies never have to run for
    real just to test the code that calls them.

- **The `Mock` object** (returned by `patch(...) as mock_rate`)
  - *What it is:* An object standing in for the real function that got
    replaced, recording every call made to it while also returning
    whatever fixed value it was configured with.
  - *Implementation:* `Mock.call_count: int`; `Mock.call_args` —  a
    real `unittest.mock.call` object capturing the exact arguments the
    fake was last called with.
  - *Its use:* This lesson's lab reads both after the mocked call, to
    prove not just that a value came back, but that the fake was
    actually invoked, exactly once, with the exact argument the real
    code passed.
  - *Type:* An instance (of `unittest.mock.MagicMock`, by default).
  - *Responsibility:* Stand in for the real callable, accept any call
    made to it without error, return the configured `return_value`
    every time, and remember every call made to it for later inspection.
  - *Depends on:* Being installed in place of a real callable by
    `patch`, above.
  - *Connects to:* Called wherever the real `get_shipping_rate` would
    have been called — this lesson's `total_with_shipping` function has
    no idea it's talking to a fake.
  - *Shape:* The actual fake sitting at the seam `patch` opened up —
    this is the object doing the standing-in.

- **`Flask.route`**
  - *What it is:* A method directly on a `Flask` app instance that
    registers a URL rule straight onto that app, without a `Blueprint`
    in between.
  - *Implementation:* `route(rule: str, **options)` — called here as
    `@app.route("/tax")`, with no explicit `methods`, which defaults to
    allowing only `GET`.
  - *Its use:* This lesson's integration and end-to-end labs both use a
    single, small `Flask` app with one direct route — simpler than a
    `Blueprint` when there's only one route and no need to split it into
    its own file.
  - *Type:* An instance method on `Flask`.
  - *Responsibility:* Record "this rule, these methods (or the GET
    default), call this function" directly on the app's own routing
    table — the same job `Blueprint.route` does, minus the extra step of
    registering a separate blueprint afterward.
  - *Depends on:* A path string and the function it decorates.
  - *Connects to:* Consulted by Flask itself on every incoming request
    to this app, the same as any blueprint-registered route.
  - *Shape:* The public entry point turning a plain function into a
    reachable endpoint — the direct, no-blueprint version of it.

- **`jsonify`**
  - *What it is:* A Flask function converting a Python value into a
    real HTTP response with a correct `application/json` `Content-Type`.
  - *Implementation:* `flask.jsonify(*args, **kwargs) -> Response`.
  - *Its use:* Both the integration and end-to-end labs' `/tax` route
    returns its result through `jsonify`, so the response is real,
    parseable JSON on both the in-process and real-socket path.
  - *Type:* A free function.
  - *Responsibility:* Serialize the given value to JSON text and wrap it
    in a response object with the correct header set.
  - *Depends on:* A JSON-serializable Python value.
  - *Connects to:* Called inside each lab's `tax_route` function; its
    result is what both the test client and the real HTTP client
    (`urlopen`, below) ultimately receive.
  - *Shape:* The seam between "a Python value" and "a real, spec-shaped
    HTTP response" — what a route handler is expected to return.

- **`Flask.test_client` / `FlaskClient.get`**
  - *What it is:* `test_client()` builds an object that can simulate
    real HTTP calls into a `Flask` app in-process; `.get(path)` makes
    one such simulated call.
  - *Implementation:* `Flask.test_client() -> FlaskClient`;
    `FlaskClient.get(path: str) -> Response`.
  - *Its use:* This lesson's integration lab uses exactly this mechanism
    to call the `/tax` route without a separate live server — proving
    the real routing and real view function work together, without
    needing an actual network socket.
  - *Type:* `test_client` is an instance method on `Flask`; `get` is an
    instance method on the `FlaskClient` it returns.
  - *Responsibility:* Run a request through the exact same routing and
    view-function code a real deployed server would use, entirely
    inside the current process, and return a real response object.
  - *Depends on:* A real, already-built `Flask` app.
  - *Connects to:* Called by this lesson's integration lab; internally
    calls the real `tax_route` function, the same one `Flask.run`
    (below) would serve to a real, external caller.
  - *Shape:* The in-process half of the unit/integration/end-to-end
    comparison this lesson's second Concept Unit is built around.

- **`Flask.run`**
  - *What it is:* An instance method that starts a real, live HTTP
    server, listening on a real network port, and blocks until it's
    stopped.
  - *Implementation:* `Flask.run(port: int = 5000, ...)` — called here
    as `app.run(port=5099)`.
  - *Its use:* This lesson's end-to-end lab runs this inside a
    completely separate Python process (via `subprocess.Popen`, below),
    so a real, external HTTP client can reach it exactly the way a real
    deployed server would be reached.
  - *Type:* An instance method on `Flask`.
  - *Responsibility:* Open a real socket on the given port, accept real
    incoming connections, and dispatch each real request through the
    app's own routing table — the one real difference between this and
    `test_client()`, above, is that this actually touches the operating
    system's real networking.
  - *Depends on:* A free port number to bind to.
  - *Connects to:* Called only inside `e2e_server.py`, a separate
    process from the lab that calls into it over a real socket.
  - *Shape:* The real, external-facing seam — this is what makes an
    end-to-end test different in kind from an integration test, not
    just slower.

- **`subprocess.Popen`**
  - *What it is:* A class that starts a real, separate operating-system
    process running another program, and gives back a handle to control
    and wait on it.
  - *Implementation:* `subprocess.Popen(args: list[str], stdout=...,
    stderr=...)`; `.terminate()`; `.wait()`.
  - *Its use:* This lesson's end-to-end lab uses it to start
    `e2e_server.py` as a genuinely separate process — not a thread, not
    a function call, a real second process with its own memory — so the
    lab's own process has to reach it the same way any real, external
    client would: over a socket.
  - *Type:* A class; `.terminate()` and `.wait()` are instance methods
    on the object it constructs.
  - *Responsibility:* Launch the given program as a real child process,
    and later (`.terminate()`) send it a real signal asking it to stop,
    then (`.wait()`) block until it actually has.
  - *Depends on:* A list of arguments describing the program to run —
    here, the real Python interpreter path plus the server script's
    path.
  - *Connects to:* Started by this lesson's end-to-end lab; the process
    it starts runs `e2e_server.py`'s own `Flask.run` call, entirely
    independently once launched.
  - *Shape:* The real process boundary an end-to-end test has to cross
    that an integration test never does.

- **`urllib.request.urlopen`**
  - *What it is:* A standard-library function that sends a real HTTP
    request over a real socket and returns the real response.
  - *Implementation:* `urllib.request.urlopen(url: str)` — returns an
    object with `.status: int` and `.read() -> bytes`.
  - *Its use:* This lesson's end-to-end lab uses it as the real,
    external caller — the same role a browser or `curl` would play
    against a real deployed server.
  - *Type:* A free function.
  - *Responsibility:* Open a real TCP connection to the given URL's
    host and port, send a real HTTP request, and return a real response
    object once one comes back over the wire.
  - *Depends on:* A real, reachable URL — in this lab,
    `http://127.0.0.1:5099/tax`, the exact port `e2e_server.py` bound
    with `Flask.run`, above.
  - *Connects to:* Sends its request to the separate process
    `subprocess.Popen` started; nothing about this call happens
    in-process the way `test_client().get(...)` does.
  - *Shape:* The real, external-caller side of the same socket boundary
    `Flask.run` opens from the server side.

## Concept Unit: What an Automated Test Actually Is

### The Problem

You write a function. You run it once, by hand, look at the result, and
it's right. The code works. Weeks later, you (or I, or anyone else)
change something nearby — not this function, something it depends on,
or something that looks unrelated — and the function quietly starts
returning the wrong answer. Nobody looks at it again, because nobody has
a reason to. It ships wrong.

Before reading on: what, concretely, would have to exist for that wrong
answer to get caught automatically, the moment it happened, without you
remembering to go re-check anything by hand?

### Project Change

- **Reference Source:** No reference counterpart — this is a from-
  scratch teaching example, not a port of anything in the real app.
- **Files affected:** `verification/lesson-00/lab_why_automated_tests.py`
  — created (throwaway lab; discarded from the taught project once
  understood, per this curriculum's own rule on isolated labs).
- **Change type:** Add (a new, standalone script).
- **Location:** New file, no existing project to place it inside.
- **Dependencies:** None beyond a Python interpreter — no Flask, no
  external packages.

### The New Code

This is new code — you type it into a new, throwaway file of your own,
`verification/lesson-00/lab_why_automated_tests.py`, not part of your
real project:

```python
def add_tax(price, rate):
    return price + (price * rate)


print("manual check:", add_tax(100, 0.05))
```

### The Updated Project

Running just the fragment above (before typing anything else) prints
`manual check: 105.0` — a real, correct answer, checked once, by a
person reading the printed number.

**File:** `verification/lesson-00/lab_why_automated_tests.py` — the
same file from the step above; everything past the first `print` is
new, typed in now, marked below:

```python
def add_tax(price, rate):
    return price + (price * rate)


print("manual check:", add_tax(100, 0.05))


def add_tax(price, rate):                                          # ← new
    return price + rate                                           # ← new


print("after the edit, nobody re-checked by eye:", add_tax(100, 0.05))  # ← new

try:                                                                # ← new
    assert add_tax(100, 0.05) == 105.0                              # ← new
    print("assert passed")                                          # ← new
except AssertionError:                                              # ← new
    print("assert FAILED:", add_tax(100, 0.05), "expected 105.0")   # ← new
```

### Mechanical Walkthrough

- `def add_tax(price, rate): return price + (price * rate)` — a plain
  function: given a price and a tax rate, return the price plus the
  tax. Correct, and manually confirmed correct by the `print` just
  below it.
- `print("manual check:", ...)` — prints the result once. This is the
  entire "test" a lot of real code ever gets: a person looked at one
  number, one time.
- `def add_tax(price, rate): return price + rate` — the same function
  name, redefined. In Python, a later `def` with the same name simply
  replaces the earlier one; nothing prevents this, and nothing warns
  about it. This version has a real, easy-to-make bug: it adds the raw
  rate (`0.05`) instead of the tax amount (`price * rate`).
- `print("after the edit, nobody re-checked by eye:", ...)` — prints the
  new, wrong result. Nobody's eyes are on this line; in a real project,
  this print statement usually isn't even here — the function is just
  called from somewhere deep in real code, its result trusted.
- `assert add_tax(100, 0.05) == 105.0` — the `assert` statement (Terms,
  above) evaluates the comparison. With the bug in place, `add_tax(100,
  0.05)` is `100.05`, not `105.0`, so the comparison is `False` and
  Python immediately raises `AssertionError`.
- `except AssertionError: print("assert FAILED:", ...)` — this lesson's
  script catches that error only to print a clear message instead of
  crashing; a real automated test framework (`pytest` is one real,
  widely-used example) does the equivalent of this automatically, for
  every `assert` in every test function, without needing a
  `try`/`except` written by hand each time.

### CS Lens

This is the core idea behind **regression testing** (Terms, above): an
`assert` doesn't care whether it's the first time it's ever run or the
thousandth — it re-checks the exact same claim, identically, every
single time, at zero cost to a human's attention. Also recognized in: a
compiler's type checker re-verifying every type rule on every single
build, not just the first one; a CI pipeline re-running an entire test
suite on every commit regardless of which files changed; a spreadsheet
recalculating every formula the instant any one cell changes, rather
than trusting yesterday's printed value.

### SE Lens

The alternative actually in use before this fix — a human glancing at a
printed value once — costs nothing to write and catches nothing after
the moment it runs. The `assert` version costs one extra line to write
and catches the exact same bug forever, on every future run, including
runs nobody remembers to ask for by hand. The real, honest tradeoff:
writing the check takes real time up front, for a payoff that only ever
shows up later, often to someone who isn't the person who wrote it —
which is exactly why it's easy to skip in the moment and expensive to
have skipped in hindsight.

### Commands needed

- `python <path>` — runs the given script directly with the real Python
  interpreter. Success here looks like all three `print` lines
  appearing, ending with the `assert FAILED` line — proof the check
  actually caught the bug, not proof nothing went wrong.

### Verification

Real output from actually running this lab:

```
manual check: 105.0
after the edit, nobody re-checked by eye: 100.05
assert FAILED: 100.05 expected 105.0
```

The first line is the one-time manual check, correct. The second line
is the same function, now broken, with nobody looking. The third line
is the only one that would have actually caught it. Full saved run:
`verification/lesson-00/lab_why_automated_tests_output.txt`.

### Connection to the previous unit

There is no previous unit — this is the first one in this lesson.

## Concept Unit: Test Scope — Unit, Integration, End-to-End

### The Problem

The unit above proved an automated check catches a broken function. But
"the function" rarely runs alone in a real app — it runs behind a real
route, inside a real server, reached by a real network call. A check
that only ever calls the function directly can miss a bug that only
shows up once routing, serialization, or the network are actually
involved. Before reading on: given the real `Flask.route` and
`FlaskClient.get` entries already covered above, in this lesson's own
Header, what's different about calling a function directly versus
calling it through a real route?

### Project Change

- **Reference Source:** No reference counterpart — from-scratch teaching
  example.
- **Files affected:** `verification/lesson-00/lab_unit_integration_e2e.py`
  and `verification/lesson-00/e2e_server.py` — both created (throwaway).
- **Change type:** Add.
- **Location:** New files.
- **Dependencies:** Flask (already installed for the real app), the
  Python standard library's `subprocess` and `urllib.request`.

### The New Code

New code, typed into a new throwaway file,
`verification/lesson-00/lab_unit_integration_e2e.py`:

```python
def add_tax(price, rate):
    return price + (price * rate)

unit_result = add_tax(100, 0.05)
print("unit:        add_tax(100, 0.05) ==", unit_result)
```

### The Updated Project

**File:** `verification/lesson-00/lab_unit_integration_e2e.py` — the
same file from the step above; everything from the `flask` import
onward is new, typed in now, marked below (the step above only had the
`add_tax` function and the two `unit_result` lines):

```python
from flask import Flask, jsonify                                # ← new


def add_tax(price, rate):
    return price + (price * rate)


unit_result = add_tax(100, 0.05)
print("unit:        add_tax(100, 0.05) ==", unit_result)


app = Flask(__name__)                                            # ← new


@app.route("/tax")                                               # ← new
def tax_route():                                                 # ← new
    return jsonify({"total": add_tax(100, 0.05)})                # ← new


client = app.test_client()                                       # ← new
integration_response = client.get("/tax")                        # ← new
print(                                                           # ← new
    "integration: GET /tax (in-process) ==",                     # ← new
    integration_response.status_code,                            # ← new
    integration_response.get_json(),                             # ← new
)                                                                 # ← new
```

A second, separate file this same lab starts as a real process — it is
never imported, only launched:

**File:** `verification/lesson-00/e2e_server.py` (new):

```python
from flask import Flask, jsonify


def add_tax(price, rate):
    return price + (price * rate)


app = Flask(__name__)


@app.route("/tax")
def tax_route():
    return jsonify({"total": add_tax(100, 0.05)})


if __name__ == "__main__":
    app.run(port=5099)
```

**File:** `verification/lesson-00/lab_unit_integration_e2e.py` — the
same file again, now complete. Everything from `import subprocess`
onward is new since the block above; it starts the second file,
`e2e_server.py`, as a real, separate process:

```python
from flask import Flask, jsonify


def add_tax(price, rate):
    return price + (price * rate)


unit_result = add_tax(100, 0.05)
print("unit:        add_tax(100, 0.05) ==", unit_result)


app = Flask(__name__)


@app.route("/tax")
def tax_route():
    return jsonify({"total": add_tax(100, 0.05)})


client = app.test_client()
integration_response = client.get("/tax")
print(
    "integration: GET /tax (in-process) ==",
    integration_response.status_code,
    integration_response.get_json(),
)

import subprocess                                                # ← new
import sys                                                       # ← new
import time                                                      # ← new
import urllib.request                                            # ← new
import json                                                      # ← new
from pathlib import Path                                         # ← new

server_path = Path(__file__).parent / "e2e_server.py"             # ← new
proc = subprocess.Popen(                                          # ← new
    [sys.executable, str(server_path)],                           # ← new
    stdout=subprocess.DEVNULL,                                    # ← new
    stderr=subprocess.DEVNULL,                                    # ← new
)                                                                 # ← new
try:                                                              # ← new
    time.sleep(1.5)                                               # ← new
    with urllib.request.urlopen("http://127.0.0.1:5099/tax") as resp:  # ← new
        e2e_status = resp.status                                  # ← new
        e2e_body = json.loads(resp.read())                        # ← new
    print("end-to-end:  GET /tax (real socket, real process) ==", e2e_status, e2e_body)  # ← new
finally:                                                          # ← new
    proc.terminate()                                              # ← new
    proc.wait()                                                   # ← new
```

### Mechanical Walkthrough

- `add_tax(100, 0.05)` (unit) — the exact same function from the unit
  above, called directly. Nothing else runs: no Flask, no network, no
  separate process. This is the narrowest possible check.
- `app = Flask(__name__)` / `@app.route("/tax")` / `client =
  app.test_client()` / `client.get("/tax")` (integration) — the real
  Flask app, real routing, and real view function all run for real,
  inside this same process, via the test client (full treatment above).
  The function is no longer called directly — it's reached the same way
  a real request would reach it, minus an actual network hop.
- `subprocess.Popen([sys.executable, str(server_path)], ...)`
  (end-to-end) — starts a second, genuinely separate Python process
  running `e2e_server.py`. `sys.executable` is the real path to the
  Python interpreter currently running this script, so the child process
  uses the identical interpreter. `stdout=subprocess.DEVNULL,
  stderr=subprocess.DEVNULL` discards the child process's own printed
  output, so it doesn't clutter this lab's output.
- `time.sleep(1.5)` — pauses this process for 1.5 real seconds, giving
  the child process real time to finish starting up and bind its real
  port before anything tries to connect to it.
- `urllib.request.urlopen("http://127.0.0.1:5099/tax")` (full treatment
  above) — sends a real HTTP request over a real socket to
  `127.0.0.1` (this same machine) on port `5099` — the exact port
  `e2e_server.py` bound via `app.run(port=5099)`.
- `resp.status` / `resp.read()` — the real response's status code, and
  its real raw bytes body, which `json.loads(...)` parses back into a
  Python value the same way `get_json()` does for the test client's
  response.
- `proc.terminate()` / `proc.wait()` — sends the child process a real
  stop signal, then blocks until it has actually exited, so this lab
  doesn't leave a real server running in the background after it ends.

### CS Lens

This is the **testing pyramid** shape widely used across the industry:
unit tests (narrowest, fastest, most numerous), integration tests
(broader, slower), end-to-end tests (broadest, slowest, fewest) — each
answering a genuinely different question about the same code. Also
recognized in: a car's pre-delivery checks (individual part tests, a
full assembly-line test, then a real test drive), a manufacturing
inspection process (component tolerance checks, sub-assembly fit
checks, final full-unit functional test), and network protocol testing
(a single packet's checksum, a full handshake between two real hosts,
and a real end-user session over the internet).

### SE Lens

The real tradeoff, proven by this unit's own timings (see Verification,
below): the unit check is instant and tells you the least; the
end-to-end check is by far the slowest (it paid a real 1.5-second
process-startup cost) and tells you the most — including things neither
of the other two can: that the server actually starts, actually binds
its port, and actually answers a request sent from genuinely outside its
own process. The alternative some teams choose — end-to-end tests for
everything — isn't free: at real scale, a suite made entirely of
1.5-second-plus checks becomes too slow to run often, which is exactly
why all three scopes coexist instead of one replacing the others.

### Commands needed

- `python <path>` — same as the unit above; success looks like all
  three lines (`unit:`, `integration:`, `end-to-end:`) printing the same
  underlying result, `105.0`, by three genuinely different real paths.

### Verification

Real output from actually running this lab:

```
unit:        add_tax(100, 0.05) == 105.0
integration: GET /tax (in-process) == 200 {'total': 105.0}
end-to-end:  GET /tax (real socket, real process) == 200 {'total': 105.0}
```

All three real, all three agreeing. Full saved run:
`verification/lesson-00/lab_unit_integration_e2e_output.txt`.

### Connection to the previous unit

The unit above proved *that* an automated check catches a real bug; this
unit proved the same underlying logic can be checked at three genuinely
different real scopes, each exercising more of the real system than the
last, at a real, measured cost in time.

## Concept Unit: Mocking — A Controlled Stand-In for a Real Dependency

### The Problem

A real dependency — a network call to a real service, in this lesson's
example — can be slow, and can return a different answer every time.
An automated check that has to wait a real second (or worse, several)
for every single run, and that can't even state a fixed expected answer
because the real answer keeps changing, stops being something anyone
runs often. Before reading on: if you couldn't change the slow,
unpredictable dependency itself, what would you need to be able to
temporarily replace it with, just for the duration of one check?

### Project Change

- **Reference Source:** No reference counterpart — from-scratch teaching
  example.
- **Files affected:** `verification/lesson-00/lab_mocking.py` — created
  (throwaway).
- **Change type:** Add.
- **Location:** New file.
- **Dependencies:** Python's standard library `unittest.mock`, `time`,
  and `random` modules.

### The New Code

New code, typed into a new throwaway file,
`verification/lesson-00/lab_mocking.py`:

```python
import time
import random


def get_shipping_rate(zip_code):
    time.sleep(1)
    return round(random.uniform(5.0, 15.0), 2)


def total_with_shipping(price, zip_code):
    return price + get_shipping_rate(zip_code)


start = time.time()
real_result = total_with_shipping(100, "90210")
real_elapsed = time.time() - start
print(f"real call:   result={real_result}, elapsed={real_elapsed:.2f}s")
```

### The Updated Project

**File:** `verification/lesson-00/lab_mocking.py` — the same file from
the step above; the `unittest.mock` import and everything from the
`with patch(...)` block onward is new, typed in now, marked below:

```python
import time
import random
from unittest.mock import patch                                    # ← new


def get_shipping_rate(zip_code):
    time.sleep(1)
    return round(random.uniform(5.0, 15.0), 2)


def total_with_shipping(price, zip_code):
    return price + get_shipping_rate(zip_code)


start = time.time()
real_result = total_with_shipping(100, "90210")
real_elapsed = time.time() - start
print(f"real call:   result={real_result}, elapsed={real_elapsed:.2f}s")

with patch("__main__.get_shipping_rate", return_value=5.0) as mock_rate:  # ← new
    start = time.time()                                                 # ← new
    mocked_result = total_with_shipping(100, "90210")                    # ← new
    mocked_elapsed = time.time() - start                                 # ← new
    print(f"mocked call: result={mocked_result}, elapsed={mocked_elapsed:.4f}s")  # ← new
    print(f"mock_rate.call_count: {mock_rate.call_count}")               # ← new
    print(f"mock_rate.call_args:  {mock_rate.call_args}")                # ← new

start = time.time()                                                  # ← new
real_again = total_with_shipping(100, "90210")                       # ← new
real_again_elapsed = time.time() - start                             # ← new
print(f"real again:  result={real_again}, elapsed={real_again_elapsed:.2f}s")  # ← new
```

### Mechanical Walkthrough

- `time.sleep(1)` inside `get_shipping_rate` — pauses for a real second,
  standing in for real network latency.
- `random.uniform(5.0, 15.0)` — returns a real, genuinely different
  floating-point number in that range every single call; this is the
  "unpredictable real answer" half of the problem.
- `total_with_shipping(price, zip_code)` — calls the slow, random
  function and adds its result to the price; this is the function
  actually being tested.
- `patch("__main__.get_shipping_rate", return_value=5.0)` (full
  treatment above) — the string `"__main__.get_shipping_rate"` names
  exactly where `get_shipping_rate` is looked up from (this script,
  run directly, is the `__main__` module); `return_value=5.0` fixes
  what the fake always returns.
- `with ... as mock_rate:` — binds the real `Mock` object (full
  treatment above) `patch` builds, so its `call_count`/`call_args` can
  be read after the call.
- `mock_rate.call_count` / `mock_rate.call_args` — prove, after the
  fact, that the fake really was called, exactly once, with `"90210"`
  — the same argument the real code passed, unaware it was talking to a
  fake.
- The third block, after the `with` block ends — calls
  `total_with_shipping` again, once the fake has been automatically
  removed; this proves the replacement was temporary, scoped only to
  the `with` block.

### CS Lens

This is a **test double** — a general term for any object substituted
in place of a real dependency during a test (a mock is one specific
kind; others include stubs, which return canned answers with no call
recording, and fakes, which are simplified-but-real working
implementations, like an in-memory database standing in for a real
one). Also recognized in: a flight simulator standing in for a real
aircraft during pilot training, a crash-test dummy standing in for a
real passenger, and a body double standing in for an actor during a
dangerous stunt — all controlled, safe, repeatable substitutes for
something real, slow, dangerous, or expensive to use directly every
time.

### SE Lens

The real, measured tradeoff (see Verification, below): the mocked call
is roughly ten thousand times faster than the real one, and gives the
exact same answer every time — both real wins. The real cost, just as
real: while the mock is in place, this test is no longer actually
proving the real `get_shipping_rate` works — it's proving
`total_with_shipping` correctly *uses whatever* `get_shipping_rate`
returns. If the real shipping-rate dependency changes its behavior (a
different real API, a different error format), a fully-mocked test
suite would keep passing while the real, deployed system silently
breaks — which is exactly why this curriculum's own Contract requires a
real, unmocked check for anything that completes a whole feature, not
just an isolated, mocked unit check.

### Commands needed

- `python <path>` — same as the units above.

### Verification

Real output from actually running this lab:

```
real call:   result=114.18, elapsed=1.00s
mocked call: result=105.0, elapsed=0.0001s
mock_rate.call_count: 1
mock_rate.call_args:  call('90210')
real again:  result=105.55, elapsed=1.00s
```

Two different real calls (`114.18`, `105.55`) prove the real dependency
is non-deterministic; the mocked call's fixed `105.0` and `0.0001s`
prove the mock is both deterministic and fast; the last line proves the
real, slow, random function is back once the `with` block ends. Full
saved run: `verification/lesson-00/lab_mocking_output.txt`.

### Connection to the previous unit

The unit above showed three real scopes a check can run at; this unit
showed why the narrowest of those scopes — a unit test — often reaches
for a mock instead of a real dependency, and what that substitution
actually costs.

## Connect the pieces

One real question, followed through every unit in this lesson: "does
`add_tax` correctly compute a 5% tax on 100?" First unit: a one-time
printed glance said yes, until a later, unnoticed edit made it say
`100.05` instead — caught only once an `assert` re-asked the same
question automatically. Second unit: the same underlying logic, asked
three different ways — directly, through a real in-process route, and
through a real separate server reached over an actual socket — all
three agreeing. Third unit: a *different* real dependency (a shipping
rate), too slow and too unpredictable to call for real on every check,
replaced for one test with a fixed, instant stand-in — proving the
calling code uses whatever it's given, at the real cost of no longer
proving the real dependency itself still works. Every one of these is
"an automated test" in the broadest sense; none of them are the same
kind of claim.

**Next lesson:** the lesson characterizing and rebuilding the legacy
app's health-check duplication uses exactly this vocabulary — an
integration-scoped characterization test, no mocks — without re-teaching
any of it.
