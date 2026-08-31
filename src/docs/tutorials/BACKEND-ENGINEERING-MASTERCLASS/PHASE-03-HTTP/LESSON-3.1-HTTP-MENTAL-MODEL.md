# Lesson 3.1: HTTP Mental Model

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Four real, run checks that build up HTTP's core vocabulary from nothing but this project's own real backend and Python's own standard library: starting this project's actual `run.py` as a genuinely separate process and reaching it as a real, external client would; sending a complete, valid HTTP request as literal bytes over a raw socket, with no HTTP-specific library involved at all; reading a real response back in that identical raw shape; and, last, independently proving HTTP's own defining trait against this project's real, write-protected `create_machine` route - that the exact same, already-authenticated client gets flatly rejected on its very next request the moment it stops resending its own credentials.

**What you need to know first:** What a Flask view function is and how a route matches a URL to one; what a decorator wrapping a view function can do before that function's own body runs; what JSON serialization is; how to run a real Python script from a real, running virtual environment.

## Terms used in this lesson

- **HTTP** — The real, plain-text application protocol this entire project's backend and frontend actually speak to each other - a request/response protocol, plain enough to be constructed by hand from a raw socket (this lesson's own request unit does exactly that). It exists as one shared, agreed-upon format so a client and server, written by different people in different languages, can still understand exactly what the other one is asking for or sending back.
- **client** — The real program that opens a connection and sends the first message in an HTTP exchange, asking a server for something. It exists as one half of a deliberate two-role split - a client never listens for incoming connections on its own; it only ever initiates.
- **server** — The real, separate program (here, this project's own Flask app, run via `run.py`) that listens on a real, known network port and waits for a client to connect, before sending back exactly one real response per real request. It exists as the other half of that same split - nothing happens on the server's side of this exchange until a client actually asks.
- **request** — The real, complete message a client sends to a server, structured as a start line (naming the method and URL), one or more header lines, a blank line, and an optional body - this lesson's own request unit sends exactly that shape, by hand, over a raw socket. It exists as the one real, agreed-upon shape a server can always parse the same way, regardless of who wrote the client.
- **response** — The real, complete message a server sends back, structured the same way a request is - a status line (naming the real outcome), header lines, a blank line, and an optional body. It exists so a client gets back not just data, but a real, structured account of what happened, in a shape it can parse exactly as reliably as the server parsed the request.
- **TCP connection** — The real, ordered, reliable byte stream two programs establish over a network (or, as in this lesson, over the local loopback address) before any HTTP request can be sent at all - opened once, by the client, via a real socket. It exists as the real transport HTTP is written on top of; HTTP itself defines only what bytes to send once this connection already exists, not how the connection itself gets made.
- **status line** — The real first line of an HTTP response, naming the protocol version and a real three-digit outcome (`HTTP/1.1 200 OK`, this lesson's own response unit shows verbatim). It exists as the one line a client can check first, before it ever has to parse anything else in the response.
- **header** — One real line of an HTTP message, before its blank-line separator, carrying one real piece of metadata as a `Name: value` pair - `Content-Type: application/json`, in this lesson's own response unit. It exists so real information about a message (its format, its length) travels with the message itself, without being mixed into the actual body.
- **body** — The real, optional data an HTTP message carries after its own blank-line separator - absent in this lesson's own request (a bare `GET` needs none), and a real JSON string in its response. It exists as the one part of the message meant to be read as content, not metadata.
- **statelessness** — The real property that a server keeps no memory of any earlier request once that request's own response has been sent - proven directly in this lesson's own last unit, where the same real client, on the very next real request, gets rejected unless it resends its own credentials. It exists, as a deliberate constraint HTTP is built on, so any server can handle any client's request without needing to first recall anything about that client's past.

## Objects and methods used

- **`subprocess.Popen`**
  - *What it is:* A real class in Python's own standard library `subprocess` module, used to launch and manage a genuinely separate OS process.
  - *Implementation:* `subprocess.Popen([sys.executable, "run.py"], cwd="backend", stdout=..., stderr=..., text=True)` starts a real new process running this project's own `run.py`, immediately returning control to the calling script without waiting for that process to finish - `sys.executable` is the real, absolute path to the same Python interpreter running this script, and `cwd="backend"` sets that new process's real working directory so `run.py`'s own relative imports resolve correctly.
  - *Its use:* This lesson uses it once, in its first unit, to start this project's own real backend server as a genuinely separate process - the real specimen every later unit in this lesson connects to.
  - *Type:* A real class from the standard library `subprocess` module.
  - *Responsibility:* Launching a real, independent OS process and handing back a real handle (`.pid`, `.terminate()`, `.wait()`) for managing its lifetime.
  - *Depends on:* A real, runnable command (here, the same Python interpreter plus a real script path) and, optionally, a real working directory.
  - *Connects to:* The real process it starts is what this lesson's every later unit actually connects to over a real socket; `.terminate()` and `.wait()`, called once this lesson's own labs are done, are what actually stop it.
  - *Shape:* Takes a real command list (and keyword options) in; returns a real `Popen` object out, whose `.pid` is a real `int` and whose `.terminate()`/`.wait()` control the real process's lifetime.

- **`requests.get (Response .status_code / .json())`**
  - *What it is:* `requests.get` is the real top-level function from the third-party `requests` library, sending a real HTTP `GET` request over an actual TCP connection; the object it returns is a real `Response`.
  - *Implementation:* `requests.get("http://127.0.0.1:5000/health", timeout=1)` opens a genuinely real TCP connection to `127.0.0.1` port `5000` and sends a real `GET /health` request; the `Response` it returns carries `.status_code` (a real `int`) and `.json()` (a method parsing the real body as JSON, returning a plain `dict`).
  - *Its use:* This lesson's own first unit calls this in a real retry loop, waiting for the real server process it just started to actually begin listening, then reads the real response it gets back.
  - *Type:* A real module-level function (`requests.get`) and a real class (`requests.Response`) from the third-party `requests` library.
  - *Responsibility:* Actually opening a real network connection and sending a real request, the same way a real browser or any other real HTTP client would - unlike a Flask test client, no part of this ever runs in the same process as the server.
  - *Depends on:* A real, reachable URL - here, this lesson's own real server process, already listening on port `5000`.
  - *Connects to:* Called repeatedly, in a loop, until this lesson's own real server process is actually ready; its real return value is what this unit prints and asserts against.
  - *Shape:* Takes a real URL string (plus options) in; returns one real `Response` object out, whose `.status_code` is an `int` and `.json()` is a `dict`.

- **`socket.socket (.connect / .sendall / .recv / .close)`**
  - *What it is:* The real, raw networking class from Python's own standard library `socket` module - the actual mechanism both `requests` and Flask's own real server are themselves built on top of, used directly in this lesson with no HTTP-specific library at all.
  - *Implementation:* `socket.socket(socket.AF_INET, socket.SOCK_STREAM)` creates a real TCP socket; `.connect(("127.0.0.1", 5000))` opens a real connection to this lesson's own running server; `.sendall(raw_request)` writes real bytes onto that connection; `.recv(4096)` reads up to 4096 real bytes back at a time, returning an empty `bytes` object once the server closes its end; `.close()` releases the real connection.
  - *Its use:* This lesson's own request and response units use this directly, with the literal real bytes of an HTTP message typed out by hand, specifically so no framework hides what a request or response actually is.
  - *Type:* A real class (and its real instance methods) from the standard library `socket` module.
  - *Responsibility:* Providing the real, raw TCP byte stream that HTTP itself is written on top of - moving real bytes in and real bytes out, with no knowledge of HTTP's own request/response structure at all.
  - *Depends on:* A real, reachable address and port - the same real server process this lesson's first unit already started.
  - *Connects to:* `.sendall` is what actually puts this lesson's own hand-written real request bytes onto the wire; `.recv`, called in a loop until it returns empty, is what collects every real byte of the response back.
  - *Shape:* `.connect` takes a real `(host, port)` tuple; `.sendall` takes real `bytes` in; `.recv` takes a real buffer size in and returns real `bytes` out, empty once the other end closes.

- **`FlaskClient (.post)`**
  - *What it is:* The real test client this project's own `app.test_client()` returns - the same real class already used to test HTTP routes in this curriculum, this time sending a real `POST`.
  - *Implementation:* `.post(path, json=..., headers=...)` is a real method on `FlaskClient`, simulating a real HTTP `POST` request against the given path, with a real, automatically-serialized JSON body and an optional real `headers` dict - the same real client object can be reused for a second, separate call, exactly as this lesson's own statelessness unit does.
  - *Its use:* This lesson calls `.post` twice, on the identical real client object, specifically to check whether anything from the first real call carries over into the second.
  - *Type:* A real instance method on `FlaskClient`.
  - *Responsibility:* Simulating a real, complete HTTP `POST` request - method, URL, headers, and body together - against this app's own real routing, in-process.
  - *Depends on:* A fully-built `Flask` app instance; a real path; an optional real JSON body and headers dict.
  - *Connects to:* Both of this lesson's own real requests in its statelessness unit go through this same method, on the same real client object; each real call independently reaches `token_required`, then, if allowed through, `create_machine`.
  - *Shape:* Takes a real path (and optional body/headers) in; returns one real `Response` object out, the same real class this curriculum's earlier HTTP-testing work already inspected.

- **`token_required`**
  - *What it is:* The real, existing decorator factory in this project's own backend, deciding whether a request is allowed to reach the view function it wraps at all.
  - *Implementation:* `def token_required(allowed_roles: list = None): ...` (`backend/app/utils/auth_utils.py:308-488`) - if no `Authorization` header is present at all, its own real code checks whether `'operator'` is in `allowed_roles`; if so, it lets the request through anonymously (the real bypass branch), and if not, it returns immediately with a real `401 {'error': 'Authentication token required', 'code': 'TOKEN_MISSING', ...}` (`auth_utils.py:426-436`) - the exact real branch this lesson's own statelessness unit exercises, since `create_machine`'s own `allowed_roles=['programming', 'admin']` never includes `'operator'`.
  - *Its use:* This lesson never calls it directly - it wraps `create_machine` automatically, and this lesson's own statelessness unit exists specifically to show its real no-token branch firing on a client that had valid credentials only moments before.
  - *Type:* A decorator factory - a function that returns a real decorator.
  - *Responsibility:* Deciding, independently, for every single real request, whether that specific request is allowed to proceed - never trusting anything decided for an earlier request.
  - *Depends on:* `allowed_roles`, a real list `create_machine`'s own route passes; the real `Authorization` header, if this specific request sent one.
  - *Connects to:* Wraps `create_machine`; its own real decision runs before `create_machine`'s own body ever executes, on every single real request, independently.
  - *Shape:* Takes a real list of role strings in; returns a real decorator that, applied to a view function, produces the function Flask actually registers as the route.

- **`encode_auth_token`**
  - *What it is:* The real, existing function in this project's backend producing a real, signed JWT for a given user.
  - *Implementation:* `def encode_auth_token(user_id: str, role: str) -> str:` (`backend/app/utils/auth_utils.py:163-247`) - builds a real payload with `sub` (the user ID) and `role`, then signs it with this app's own real `SECRET_KEY`.
  - *Its use:* This lesson calls it once, to produce a real, valid token for this unit's own first request - the request that succeeds, before the second, header-less request proves nothing about that success carried forward.
  - *Type:* A module-level function.
  - *Responsibility:* Producing one real, cryptographically signed token string that `token_required` can later decode and trust.
  - *Depends on:* A real user ID and role string; the real Flask app's own configured `SECRET_KEY`.
  - *Connects to:* Its real output goes straight into this lesson's own first `Authorization: Bearer <token>` header - never reused by, or referenced from, the second request at all.
  - *Shape:* Takes two real strings in; returns one real, signed token string out.

- **`create_machine`**
  - *What it is:* A real, existing Flask view function creating a new machine row in the database.
  - *Implementation:* `@machines_bp.route('', methods=['POST'])` `@token_required(allowed_roles=['programming', 'admin'])` `def create_machine(current_user): ...` (`backend/app/routes/machines.py:118-169`) - reads `request.get_json()`, validates required fields, returns `400` if any are missing or the ID already exists, otherwise builds and commits a real new `Machine` row, returning `201`.
  - *Its use:* This lesson calls it twice, through `token_required`, specifically because its own `allowed_roles=['programming', 'admin']` never includes `'operator'` - the one real bypass condition `token_required`'s own code checks for - so a missing `Authorization` header genuinely, unconditionally fails here.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Validating a real new-machine request and creating exactly one real `Machine` row - or reporting a specific real reason it couldn't.
  - *Depends on:* A real, valid JSON body; `token_required`'s own real decision about whether this specific request is allowed through at all.
  - *Connects to:* Wrapped by `token_required(allowed_roles=['programming', 'admin'])`, which runs first, on every real request, before this function's own body ever executes.
  - *Shape:* Reads a real dict in (from `request.get_json()`); returns a real `(dict, int)` tuple on an error path, or a real, `jsonify`-wrapped dict with an explicit `201` on success.

## Concept Unit: Client and Server - Two Real, Separate Processes

### The Problem

Every real HTTP exchange this curriculum builds from here needs two sides. What actually makes one program a "client" and another a "server," concretely - not as a role name, but as two genuinely separate, real running programs?

Before reading on:

- This project's own `run.py` calls `socketio.run(app, host='0.0.0.0', port=5000, ...)`, which never returns while the server is running. What would have to be true of any other real program that wants to talk to it - could that other program just call `run.py`'s own functions directly, the way this curriculum's own earlier HTTP-testing work called `get_machine`'s and `update_machine_status`'s functions directly, in-process?
- If this lesson's own script and `run.py` are both just Python, running on the same machine, what's the one real, concrete thing that actually makes them two separate programs rather than one - something you could point at, not just describe?

### Project Change

- **Reference Source:** Real specimen: `backend/run.py:1-19`, read again this session - this project's own real, actual server entry point, unmodified.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real `backend/run.py`, started as a genuinely separate process; the real, third-party `requests` library.

### The New Code

One real script that starts this project's own actual server as a separate process, waits for it to actually be listening, then reaches it as a real, external client would:

**File:** `verification/phase-03/lab_http_client_server.py` (new)

```python
import subprocess
import sys
import time

import requests

server = subprocess.Popen(
    [sys.executable, "run.py"],
    cwd="backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
)

try:
    deadline = time.time() + 20
    ready = False
    attempt = 0
    while time.time() < deadline:
        attempt += 1
        try:
            response = requests.get("http://127.0.0.1:5000/health", timeout=1)
            ready = True
            print(f"attempt {attempt}: connected")
            break
        except requests.exceptions.ConnectionError:
            print(f"attempt {attempt}: connection refused, server not listening yet")
            time.sleep(0.5)

    if not ready:
        raise RuntimeError("real server never became reachable")

    print("client process:", "this script, PID", __import__("os").getpid())
    print("server process: run.py, PID", server.pid)
    print("real response status:", response.status_code)
    print("real response body:", response.json())
finally:
    server.terminate()
    server.wait(timeout=10)
```

### Mechanical Walkthrough

- `server = subprocess.Popen([sys.executable, "run.py"], cwd="backend", ...)` — Actually launches this project's own real `run.py` as a genuinely separate OS process - `sys.executable`'s real path ensures the exact same Python interpreter runs it, and `cwd="backend"` sets that new process's real working directory so `run.py`'s own relative imports resolve exactly the way they do when it's run normally.
- `while time.time() < deadline: attempt += 1; try: requests.get(...) except requests.exceptions.ConnectionError: time.sleep(0.5)` — A real retry loop, tracking a real `attempt` counter - the new server process takes real, non-zero time to actually start listening (it also runs `db.create_all()` and seeds default users, real work), so this defensively keeps attempting a real connection, catching the real, specific exception a refused connection raises, until the server is actually ready. Run twice this session, the real output below shows the very first attempt already succeeding both times on this machine - the loop's own `except` branch is a real guard for a race that, while genuinely possible, never actually fired in either real run.
- `if not ready: raise RuntimeError("real server never became reachable")` — The loop's own real timeout guard - if `deadline` passes with `ready` still `False` (every attempt inside the loop failed), this stops the script with a real, explicit error instead of continuing on to use a `response` variable that was never actually assigned.
- `print("client process:", "this script, PID", __import__("os").getpid())` — Prints this lesson's own script's real OS process ID, so its own real, separate identity from the server process is directly visible, not just asserted.
- `print("server process: run.py, PID", server.pid)` — Prints the real, separate process ID `subprocess.Popen` actually assigned to `run.py` - genuinely different from the first, real, verifiable proof these are two distinct processes.
- `print("real response status:", response.status_code) / print("real response body:", response.json())` — Prints the real values this lesson's real client actually received back over the real socket connection `requests.get` opened - real proof the request/response round trip actually happened, not just that the server started.
- `finally: server.terminate(); server.wait(timeout=10)` — Stops the real, separate server process this script started, and waits for it to actually exit - cleanup with no equivalent at all in an in-process test client, which never starts a real process to begin with.

### Mental Model

```text
[ this script, PID: os.getpid() ]         [ run.py, PID: server.pid ]
            |                                          |
            |------ real TCP socket, port 5000 ------->|
            |          requests.get("/health")         |
            |                                          |
            |<----------- real HTTP response ----------|
```

### CS Lens

This is the **client-server architectural pattern**: two independent, real programs, each running as its own OS process, communicating only through a well-defined message-passing channel - here, a real TCP socket - never through shared memory or a direct function call. Also recognized in: a web browser and a website's own server; a database driver (like `psycopg2`) and a real, separately-running Postgres server process; an `ssh` client and `sshd`; a DNS resolver and a DNS server; and, in this project's own domain, a shop-floor tablet's own request talking to this exact backend over the real network the shop runs on.

### SE Lens

The design principle is that a genuine process boundary between client and server means either side can be replaced, restarted, or scaled independently, and can be written in an entirely different language, as long as both agree on the same real protocol crossing that boundary. The real alternative not chosen in this specific lab - a test client that calls straight into the same in-process Python objects, with no real socket at all - is faster and simpler to write, which is exactly why this curriculum's own earlier HTTP-testing work used exactly that; the honest cost of that earlier choice, only visible now: it never actually proves a real client, on a real network, reaching this exact server would get the same result - only this lesson's own real subprocess-plus-socket lab does that.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_client_server.py` — Runs this as a plain script, from the repository root; it starts and stops the real server process itself - no separate terminal needed. Run twice in a row this session, back to back, for the repeated real output shown below.

### Verification

```text
=== run 1 ===
attempt 1: connected
client process: this script, PID 5048
server process: run.py, PID 16104
real response status: 200
real response body: {'message': 'Manufacturing Platform API is running', 'status': 'healthy'}

=== run 2 ===
attempt 1: connected
client process: this script, PID 38884
server process: run.py, PID 33964
real response status: 200
real response body: {'message': 'Manufacturing Platform API is running', 'status': 'healthy'}
```

Full saved run: `verification/phase-03/lab_http_client_server_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the real client/server boundary every later unit in this lesson crosses.

## Concept Unit: Request - A Real Message, Sent By Hand

### The Problem

This lesson's first unit used `requests.get`, a library that builds the actual HTTP request bytes invisibly. What is a request, concretely, once nothing hides its real shape?

Before reading on:

- `requests.get("http://127.0.0.1:5000/health")` produced some real, exact sequence of bytes on the wire, even though this lesson's first unit never saw them. Given `GET /health` is the operation, what other real information would a server need, at minimum, before it could even find the right real connection to reply on?
- If a request's real body is optional but its first line isn't, what does that suggest about the actual difference between something HTTP always needs and something a specific request might not?

### Project Change

- **Reference Source:** No reference counterpart - this unit constructs a request's real raw bytes by hand, rather than citing an existing file, specifically so nothing hides its actual shape. Real server specimen reused: `backend/run.py:1-19`, already read in this lesson's first unit.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real `backend/run.py`, started the same way as this lesson's first unit; Python's own standard library `socket` module - no HTTP-specific library at all.

### The New Code

The real, literal bytes of a complete, valid HTTP request, sent over a raw socket with no HTTP library involved:

**File:** `verification/phase-03/lab_http_request_wire.py` (new)

```python
import socket
import subprocess
import sys
import time

import requests

server = subprocess.Popen(
    [sys.executable, "run.py"],
    cwd="backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
)

try:
    deadline = time.time() + 20
    while time.time() < deadline:
        try:
            requests.get("http://127.0.0.1:5000/health", timeout=1)
            break
        except requests.exceptions.ConnectionError:
            time.sleep(0.5)

    raw_request = (
        b"GET /health HTTP/1.1\r\n"
        b"Host: 127.0.0.1:5000\r\n"
        b"Connection: close\r\n"
        b"\r\n"
    )

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(("127.0.0.1", 5000))
    sock.sendall(raw_request)

    print("real bytes sent, exactly as written onto the socket:")
    print(raw_request.decode("ascii"))

    chunks = []
    while True:
        chunk = sock.recv(4096)
        if not chunk:
            break
        chunks.append(chunk)
    sock.close()

    print("total real bytes received back:", sum(len(c) for c in chunks))
finally:
    server.terminate()
    server.wait(timeout=10)
```

### Mechanical Walkthrough

- `raw_request = b"GET /health HTTP/1.1\r\nHost: 127.0.0.1:5000\r\nConnection: close\r\n\r\n"` — The real, complete request, typed by hand as literal bytes - `GET /health HTTP/1.1` is the real request line (method, path, protocol version); `Host: ...` and `Connection: close` are two real headers; the trailing `\r\n\r\n` is the real, mandatory blank line marking where headers end - with nothing after it, this request has no real body at all, which a bare `GET` doesn't need.
- `sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM); sock.connect(("127.0.0.1", 5000))` — Opens a real, raw TCP connection directly - the same real kind of connection `requests.get` opened in this lesson's first unit, just without a library hiding the step.
- `sock.sendall(raw_request)` — Writes the real, exact bytes above onto that real connection - literally what "sending a request" actually is, once every layer of abstraction is removed.
- `print(raw_request.decode("ascii"))` — Prints those same real bytes back as text, so the real request this script just sent is directly visible, not just described.
- `chunks = []; while True: chunk = sock.recv(4096); ...; print("total real bytes received back:", ...)` — Confirms a real response actually came back over the same connection - this unit's own point stops at the request; the next unit picks up exactly these same real bytes to examine the response itself.

### CS Lens

This is **protocol framing**: an HTTP request is nothing more than plain, structured ASCII text sent as bytes over an already-open connection, in an order both ends have agreed on in advance (a request line, then header lines, then a blank line, then an optional body). Also recognized in: an SMTP client typing plain-text commands to a mail server one line at a time; a Redis client's own plain-text command protocol; the AT command set a modem still speaks over a serial line; and, in this project's own domain, a G-code program's own line-by-line, agreed-upon text format sent to a machine control.

### SE Lens

The real design principle is a deliberately simple, human-readable text format - a real choice HTTP's own message format makes, still verifiable directly: this unit's own lab just built a fully valid request by hand, using nothing but three real lines of literal text and a raw socket, no HTTP-specific library code at all. The real alternative not chosen - a dense binary framing, the kind a protocol like gRPC uses instead - would encode the same information in fewer real bytes; the honest cost of the plain-text shape HTTP actually uses: every real request pays that verbosity, spelling out every header name in full, on every single call, in exchange for exactly what this unit's own lab demonstrated - readability and constructability without any protocol-specific library at all.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_request_wire.py` — Runs this as a plain script, from the repository root.

### Verification

```text
real bytes sent, exactly as written onto the socket:
GET /health HTTP/1.1
Host: 127.0.0.1:5000
Connection: close


total real bytes received back: 220
```

Full saved run: `verification/phase-03/lab_http_request_wire_output.txt`.

### Connection to the previous unit

The previous unit established two real, separate processes and confirmed a request/response round trip happened between them, through a library that hid the details; this unit sends the identical kind of request again, this time with nothing hidden.

## Concept Unit: Response - The Same Real Shape, Coming Back

### The Problem

The previous unit's own raw request got a real response back, but only its total byte count was ever shown. What does that response actually say, once its own real bytes are read the same way the request's were written?

Before reading on:

- A response's first line and a request's first line occupy the exact same real position in the message - right at the start, before any headers. Given `GET /health HTTP/1.1` names a method and path, what would a response's own first line need to name instead, since it isn't asking for anything?
- This project's own `create_app` calls `CORS(app, resources={r"/*": {"origins": "*"}})`, adding a real header to every real response. Before reading below, what would you expect that real header's own name to be, given what it's for?

### Project Change

- **Reference Source:** Real specimen: `backend/app/__init__.py:283` (`CORS(app, resources={r"/*": {"origins": "*"}})`) and `backend/app/__init__.py:426-439` (`health_check`), both read again this session - the real code responsible for this response's own real headers and real body.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real `backend/run.py`, started the same way as this lesson's earlier units; Python's own standard library `socket` module.

### The New Code

The identical real request as the previous unit, this time reading its full real response and printing every real part of its shape:

**File:** `verification/phase-03/lab_http_response_wire.py` (new)

```python
import socket
import subprocess
import sys
import time

import requests

server = subprocess.Popen(
    [sys.executable, "run.py"],
    cwd="backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
)

try:
    deadline = time.time() + 20
    while time.time() < deadline:
        try:
            requests.get("http://127.0.0.1:5000/health", timeout=1)
            break
        except requests.exceptions.ConnectionError:
            time.sleep(0.5)

    raw_request = (
        b"GET /health HTTP/1.1\r\n"
        b"Host: 127.0.0.1:5000\r\n"
        b"Connection: close\r\n"
        b"\r\n"
    )

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(("127.0.0.1", 5000))
    sock.sendall(raw_request)

    chunks = []
    while True:
        chunk = sock.recv(4096)
        if not chunk:
            break
        chunks.append(chunk)
    sock.close()

    raw_response = b"".join(chunks).decode("ascii")
    head, _, body = raw_response.partition("\r\n\r\n")
    status_line, _, header_text = head.partition("\r\n")

    print("real status line:", repr(status_line))
    print("real headers:")
    print(header_text)
    print("real body:", repr(body))
finally:
    server.terminate()
    server.wait(timeout=10)
```

### Mechanical Walkthrough

- `raw_response = b"".join(chunks).decode("ascii")` — Joins every real chunk `sock.recv` returned into the complete real response text - the same real bytes the previous unit only counted, now actually read.
- `head, _, body = raw_response.partition("\r\n\r\n")` — Splits the real response at its own blank-line separator - the identical real marker the previous unit's own request used to mark the end of its headers - into everything before it (status line plus headers) and everything after (the real body).
- `status_line, _, header_text = head.partition("\r\n")` — Splits that first real chunk again, at its first real line break, isolating the real status line from the real headers that follow it.
- `print("real status line:", repr(status_line))` — Shows the real status line this exact request actually got back - `HTTP/1.1 200 OK`, naming the same real protocol version as the request, plus a real three-digit outcome and its standard reason phrase.
- `print("real headers:"); print(header_text)` — Shows the real header lines this response actually carried - including `Access-Control-Allow-Origin: *`, produced by this project's own real `CORS(...)` call (`backend/app/__init__.py:283`), not by anything this lesson's own script did.
- `print("real body:", repr(body))` — Shows the real body text - the same real dict `health_check()` (`backend/app/__init__.py:426-439`) returns, now visible as the literal real bytes that traveled back over the wire, not a `dict` a library already parsed for you.

### CS Lens

This is the same real **protocol framing** as the previous unit, mirrored: a status line (this connection's own real verdict), then real headers describing the body that follows (its length, its real format), then a blank line, then the real body itself. Also recognized in: an SMTP server's own numbered reply codes (`250 OK`, `550` rejected) preceding its own text; an HTTP proxy or CDN inspecting only a response's real headers before deciding whether to cache the body at all; a shipping label carrying real routing metadata separate from the real package it's attached to; and, in this project's own domain, a machine control's own alarm response - a real code, then a real human-readable message, then whatever data the query actually asked for.

### SE Lens

The design principle is real symmetry: a client and server exchange the same real structure - a status/request line, then headers, then a blank line, then an optional body - in both directions, so one real parser handles both a request and a response, differing only in what the first line names. The real alternative not chosen - a genuinely different format for requests versus responses - would need two separate real parsers for what is, underneath, the identical framing question of where the header block ends and the real payload begins; the honest cost of the shared shape actually chosen: a status line's very different real content (`HTTP/1.1 200 OK` versus a request line's `GET /health HTTP/1.1`) can look enough alike, positionally, to blur which end of the exchange produced it, without checking context.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_response_wire.py` — Runs this as a plain script, from the repository root.

### Verification

```text
real status line: 'HTTP/1.1 200 OK'
real headers:
Content-Type: application/json
Content-Length: 80
Access-Control-Allow-Origin: *
Date: Mon, 31 Aug 2026 00:28:26 GMT
real body: '{\n  "message": "Manufacturing Platform API is running",\n  "status": "healthy"\n}\n'
```

Full saved run: `verification/phase-03/lab_http_response_wire_output.txt`.

### Connection to the previous unit

The previous unit sent a request as real, literal bytes and only confirmed a response came back; this unit reads those same real bytes all the way through, in the identical real shape - status line, headers, blank line, body.

## Concept Unit: Statelessness - What the Server Remembers Between Two Real Requests

### The Problem

Every response this lesson has shown so far came from a request that stood entirely on its own. This project's own `token_required` (`backend/app/utils/auth_utils.py:401-436`) checks for a real `Authorization` header on every single request it wraps. Does a request that already proved who it is change what the very next request, from the same real client, still has to prove?

Before reading on:

- If the same `client` object sends two real requests in a row, and the first one includes a real, valid `Authorization` header, what would you expect the second request - sent with no `Authorization` header at all - to do, before reading the real output below?
- This project's backend never imports Flask's own real `session` object anywhere (confirmed by a real search across every file under `backend/` this session, with zero matches). Given that, what would have to exist somewhere in this project's own code for a server to remember request 1 while handling request 2 at all?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:118-169` (`create_machine`) and `backend/app/utils/auth_utils.py:401-436` (`token_required`'s own no-token branch), both read again this session. A real search across every `.py` file under all of `backend/` (excluding its own `.venv`) for any import of Flask's own `session` object, run this session, returns zero matches - this project's real backend never uses it anywhere.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `User` row; a real, valid token from `encode_auth_token`; the same real `FlaskClient` object, reused for two separate real requests.

### The New Code

Two real requests to the same real, write-protected route, sent from the identical client object - the second with no credentials at all:

**File:** `verification/phase-03/lab_http_statelessness.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "programming")
    client = app.test_client()

    r1 = client.post(
        "/api/machines",
        json={"id": "M-STATE-001", "name": "Test Mill", "category": "mill", "subType": "3_axis", "manufacturer": "Haas", "model": "VF-2"},
        headers={"Authorization": f"Bearer {token}"},
    )
    print("request 1 (real Authorization header, same client) -> status:", r1.status_code)

    r2 = client.post(
        "/api/machines",
        json={"id": "M-STATE-002", "name": "Test Mill 2", "category": "mill", "subType": "3_axis", "manufacturer": "Haas", "model": "VF-2"},
    )
    print("request 2 (no Authorization header, SAME client object) -> status:", r2.status_code, "body:", r2.get_json())

    assert r1.status_code == 201
    assert r2.status_code == 401
    print("the same client that just authenticated successfully gets rejected on its very next request - nothing about request 1 carried over")
```

### Mechanical Walkthrough

- `user = User(id="U-TEST-001", email="test-prog@example.com", name="Test Programmer", role="programming")` — Builds one real `User` row with a real `programming` role - required so `token_required`'s own real lookup, once it decodes a real token's `sub` claim, resolves to a genuine user rather than returning its real `401 USER_NOT_FOUND`.
- `client = app.test_client()` — Builds one real `FlaskClient`, reused for both of this unit's real requests - the same real object, not a fresh one per call, is exactly what makes this unit's own statelessness check honest: if anything were carried between requests, this is the one real object that would have to carry it.
- `token = encode_auth_token("U-TEST-001", "programming")` — Produces one real, valid, signed token for a real `programming`-role user - `create_machine`'s own `allowed_roles=['programming', 'admin']` accepts this real role.
- `r1 = client.post("/api/machines", json={...}, headers={"Authorization": f"Bearer {token}"})` — Sends a real, fully authenticated `POST` - `token_required` decodes the real token, finds the real user, confirms `'programming'` is allowed, and lets `create_machine`'s own real body run, committing a real new `Machine` row.
- `r2 = client.post("/api/machines", json={...}) (no headers argument)` — Sends a second, separate real request, on the identical `client` object just used above, with no `Authorization` header at all - nothing from request 1 is passed along on purpose, to test what the server itself still remembers.
- `assert r1.status_code == 201 / assert r2.status_code == 401` — Confirms both real, opposite outcomes - the same client, the same route, one real difference (a resent header), two completely different real results.

### Execution Trace

1. `r1 = client.post(...)` with a real `Authorization` header - `token_required`'s own real code (`auth_utils.py:401-410`) extracts a real token from the header, decodes and verifies it (`auth_utils.py:441-463`), confirms `'programming'` is in `create_machine`'s own `allowed_roles` (`auth_utils.py:469-478`), and calls straight through to `create_machine`'s own real body (`auth_utils.py:485`, `return f(current_user, *args, **kwargs)`) - a real new `Machine` row is committed, and `r1.status_code` is `201`.
2. `r2 = client.post(...)` with no `headers` argument at all - `token_required` runs completely fresh, from its own first real line (`auth_utils.py:401`, `token = None`); nothing from step 1 is read, checked, or even reachable from here. `request.headers` has no real `Authorization` entry, `token` stays `None`, and since `'operator'` is not in `create_machine`'s own `allowed_roles`, `token_required`'s real bypass branch never fires - it returns the real `401 TOKEN_MISSING` response (`auth_utils.py:426-436`) immediately, before `create_machine`'s own body ever runs a second time.

### CS Lens

This is the **stateless request model** - the real, defining trait of HTTP itself: a server that keeps zero real memory of any earlier request, from any client, once that earlier request's own response has been sent. Also recognized in: statelessness as one of REST's own defining constraints; a pure function that carries no memory between calls, always reasoning only from the arguments it's actually given; a vending machine that forgets every prior coin the instant it dispenses, requiring full real payment again next time; and, in this project's own domain, a G-code program that, on most real controls, starts each new block with no memory of modal state from a previous, separately-loaded program.

### SE Lens

The design principle is that every real request must carry everything the server needs to handle it, on its own, every single time - here, a real `Authorization` header, resent in full on every protected call, never assumed from a moment ago. The real alternative this project deliberately did not choose - Flask's own real `session` mechanism, which this codebase never imports at all - would let a server remember an earlier real login via a cookie; the honest cost of the stateless choice this project actually made, proven directly by this unit's own second request: a client that just, moments ago, proved who it is gets exactly as rejected as a client that never has, the instant it forgets to resend its own credentials.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_http_statelessness.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
request 1 (real Authorization header, same client) -> status: 201
request 2 (no Authorization header, SAME client object) -> status: 401 body: {'code': 'TOKEN_MISSING', 'error': 'Authentication token required', 'path': '/api/machines'}
the same client that just authenticated successfully gets rejected on its very next request - nothing about request 1 carried over
```

Full saved run: `verification/phase-03/lab_http_statelessness_output.txt`.

### Connection to the previous unit

Every earlier unit in this lesson checked what a single request/response exchange actually looks like; this unit runs two, back to back, from the identical real client, to check what - if anything - the server actually kept from the first one.

## Connect the pieces

One real HTTP round trip, traced end to end: this project's own real `run.py`, started as a genuinely separate process, reached first through a library that hid the wire (`requests.get`) - two real, separate programs, proven by two real, different process IDs (client and server). Then again by hand, as the real literal bytes of a request - a start line, two real headers, a blank line, no body (request) - sent over a raw socket to that same real server. The real bytes that came back, split at the identical blank-line marker into a real status line, real headers (including one this project's own `CORS(...)` call actually adds), and a real JSON body (response). And finally, the one real property tying every earlier unit together: a second real request, from the identical real client that had just proven who it was, getting flatly rejected the moment it stopped resending its own proof - because this project's own server, like any real HTTP server, kept no memory of the first request at all (statelessness).

**Next lesson:** This lesson treated `GET` and `POST` only as far as telling apart a read from a write; next, this curriculum studies every real HTTP method this project's own backend actually uses, and what real, meaningfully different thing each one is supposed to promise.