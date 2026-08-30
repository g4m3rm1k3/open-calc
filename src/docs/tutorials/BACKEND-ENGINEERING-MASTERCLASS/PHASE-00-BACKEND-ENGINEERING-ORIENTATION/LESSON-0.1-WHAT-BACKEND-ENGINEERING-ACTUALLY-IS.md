# Lesson 0.1: What Backend Engineering Actually Is

*File paths under `backend/...` and `package.json`/`src/...` refer to
the real `manufacturing-platform` repository — the actual app this
curriculum is built from. Paths under `verification/...` refer to that
same repository's verification folder.*

**What you will build:** Nothing that ships — one real, minimal client
and server, talking to each other over an actual network socket, with
no framework underneath them at all. The transferable problem: every
backend this curriculum will touch — this manufacturing app included —
is, underneath every framework, exactly this: two separate programs,
unable to call each other's functions directly, agreeing to exchange
bytes over a real, addressable connection.

**What you need to know first:** A Python function; that a program can
be started and run.

## Terms used in this lesson

- **Client** — the program that initiates a request. It doesn't have
  to be a browser; it's simply whichever side starts the conversation.
  It exists as a role, not a specific technology — the same real
  program can be a server in one connection and a client in another.
- **Server** — the program that waits for a request and responds to
  it. It exists to sit ready, listening, so a client doesn't have to
  coordinate the exact moment the other side starts running.
- **Process** — one running instance of a program, with its own
  private memory nothing else can reach directly. It matters here
  because a client and a server are always at least two separate
  processes — that separation is *why* they need a network connection
  to talk at all, instead of a normal function call.
- **Socket** — a real, addressable endpoint a process opens so another
  process — on the same machine or a different one entirely — can
  connect to it. It's the actual object both sides use to send and
  receive real bytes; there is nothing more fundamental underneath it
  in ordinary application code.
- **Host** — the address (here, `127.0.0.1`, meaning "this same
  machine") identifying *which* machine a socket belongs to.
- **Port** — a number identifying *which* listening socket on that
  machine a connection is meant for, since one machine can run many
  network-facing programs at once.
- **TCP (Transmission Control Protocol)** — the specific real protocol
  `socket.SOCK_STREAM` requests: a connection that guarantees bytes
  arrive in the order they were sent, and that the sender finds out if
  they didn't arrive at all. It exists because raw networks can drop,
  duplicate, or reorder data; TCP is what makes "send bytes, receive
  the same bytes, in the same order" a safe assumption to build on.
- **Byte string** (`b"..."`) — a Python string literal holding raw
  bytes rather than Unicode text. It matters here because a real
  network connection only ever carries bytes — never Python strings,
  dictionaries, or any other Python object directly; something always
  has to convert to and from bytes at the edge, even when that
  something (like `jsonify`, in a later lesson) hides the conversion
  from view.

## Objects and methods used

- **`socket.socket`**
  - *What it is:* The class representing one endpoint of a network
    connection — the real object both the client and the server use.
  - *Implementation:* `socket.socket(family: int, type: int)` — called
    here as `socket.socket(socket.AF_INET, socket.SOCK_STREAM)`.
    `AF_INET` selects IPv4 addressing; `SOCK_STREAM` selects TCP (the
    Term, above) rather than a connectionless protocol.
  - *Its use:* Both `lab_server.py` and `lab_client.py` construct one —
    it's the object every other call in this lesson is made on.
  - *Type:* A class, instantiated once per side of the connection.
  - *Responsibility:* Represent one real, addressable network endpoint
    and provide the real operations (bind, listen, accept, connect,
    send, receive, close) that endpoint can perform.
  - *Depends on:* An address family and a socket type, chosen at
    construction and fixed for that socket's lifetime.
  - *Connects to:* Every other method in this lesson is called on the
    object this constructs.
  - *Shape:* The lowest-level real seam this curriculum will touch —
    everything Flask does later happens on top of an object like this
    one, not instead of it.

- **`socket.bind` / `socket.listen`**
  - *What it is:* `bind` claims a specific host and port for this
    socket; `listen` puts the socket into a state where it will accept
    incoming connections instead of rejecting them.
  - *Implementation:* `bind((host: str, port: int))`; `listen(backlog:
    int)` — called here as `server_socket.listen(1)`, allowing one
    pending connection to queue before being accepted.
  - *Its use:* The server calls both, in order, before it can accept
    anything — without `bind`, the operating system has no fixed
    address to route an incoming connection to; without `listen`, an
    arriving connection would be refused outright.
  - *Type:* Instance methods on `socket.socket`, server side only.
  - *Responsibility:* `bind` registers the (host, port) pair with the
    operating system as belonging to this socket; `listen` tells the
    operating system to start queuing incoming connection attempts
    instead of refusing them.
  - *Depends on:* A (host, port) tuple not already claimed by another
    listening socket.
  - *Connects to:* Called once, at server startup, before `accept`,
    below, is ever reachable.
  - *Shape:* The seam where a server becomes real and addressable to
    the outside world — before these two calls, nothing could connect
    to it at all.

- **`socket.accept`**
  - *What it is:* A blocking call that waits until a real client
    connects, then returns a new socket representing that specific
    connection.
  - *Implementation:* `accept() -> (connection: socket, address: tuple)`.
  - *Its use:* `lab_server.py` calls it once, and the program's
    execution genuinely pauses there — doing nothing else — until
    `lab_client.py` actually connects.
  - *Type:* An instance method on `socket.socket`.
  - *Responsibility:* Wait for a real incoming connection, then hand
    back a *different* socket object dedicated to that one connection,
    separate from the original listening socket (which could, in a
    fuller program, go on to accept more connections after this one).
  - *Depends on:* A socket that has already called `listen`.
  - *Connects to:* Its return value, `connection`, is what `recv` and
    `sendall` (below) are actually called on — not the original
    listening socket.
  - *Shape:* The real moment a client and server stop being two
    independent programs and start being two ends of one live
    connection.

- **`socket.connect`**
  - *What it is:* The client-side call that actually establishes a
    connection to a specific, already-listening server.
  - *Implementation:* `connect((host: str, port: int))`.
  - *Its use:* `lab_client.py` calls this against the exact host and
    port `lab_server.py` bound, above — this is the client's half of
    the moment `accept` unblocks on the server.
  - *Type:* An instance method on `socket.socket`, client side only.
  - *Responsibility:* Attempt to reach the given address; if a server
    isn't actually listening there, this call fails instead of
    succeeding — it never silently does nothing.
  - *Depends on:* A real, currently-listening server at the given
    (host, port).
  - *Connects to:* Directly causes the server's blocked `accept` call
    to return, on the other side of this same real connection.
  - *Shape:* The client-side mirror of `accept` — together, these two
    calls are the entire real handshake underneath "the client talks to
    the server."

- **`socket.sendall` / `socket.recv`**
  - *What it is:* `sendall` transmits every byte given to it over the
    connection; `recv` reads bytes that have arrived, up to a given
    maximum.
  - *Implementation:* `sendall(data: bytes) -> None`; `recv(bufsize:
    int) -> bytes` — called here as `recv(1024)`, reading up to 1024
    bytes at once.
  - *Its use:* Both the client and the server use these two calls,
    symmetrically, to actually exchange the real messages shown in
    Verification, below.
  - *Type:* Instance methods on a connected socket (the object
    `accept` returned, on the server; the socket itself, on the
    client, once `connect` has succeeded).
  - *Responsibility:* `sendall` guarantees every byte given to it is
    actually transmitted before returning (unlike the lower-level
    `send`, which can transmit only part of the data); `recv` returns
    whatever bytes have actually arrived, real network delivery
    included, never more than `bufsize`.
  - *Depends on:* An already-connected socket — calling either before
    `connect`/`accept` has succeeded is an error.
  - *Connects to:* What one side sends via `sendall`, the other side
    reads back via `recv` — this is the real channel every later
    request/response lesson in this curriculum sits on top of.
  - *Shape:* The actual data-carrying seam — everything above this
    layer (HTTP, JSON, Flask) exists to make this raw byte exchange
    easier to use correctly, not to replace it.

## Concept Unit: A Client and a Server Are Separate Programs

### The Problem

Two Python programs, `lab_server.py` and `lab_client.py`, need to
exchange a real message. Neither can call a function defined in the
other — they're separate processes (Terms, above), each with its own
private memory. Before reading on: if you couldn't call a function
across that boundary, what's the smallest, most concrete thing both
programs could agree on in advance, so one could reliably find and
reach the other at all?

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch teaching example, one level below anything in the real
  app, built to demonstrate the mechanism every real client/server
  exchange in this curriculum sits on top of.
- **Files affected:** `verification/phase-00/lab_server.py` and
  `verification/phase-00/lab_client.py` — both created (throwaway;
  discarded from the taught project once understood).
- **Change type:** Add.
- **Location:** New files, no existing project to place them within.
- **Dependencies:** Python's standard library `socket` module — no
  external packages.

### The New Code

New code, typed into a new throwaway file,
`verification/phase-00/lab_server.py`:

```python
import socket

HOST = "127.0.0.1"
PORT = 5100

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind((HOST, PORT))
server_socket.listen(1)
print(f"server: listening on {HOST}:{PORT}")
```

### The Updated Project

**File:** `verification/phase-00/lab_server.py` — the same file from
the step above; everything from `connection, address =
server_socket.accept()` onward is new, typed in now, marked below:

```python
import socket

HOST = "127.0.0.1"
PORT = 5100

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind((HOST, PORT))
server_socket.listen(1)
print(f"server: listening on {HOST}:{PORT}")

connection, address = server_socket.accept()                      # ← new
print(f"server: accepted a connection from {address}")             # ← new

data = connection.recv(1024)                                       # ← new
print(f"server: received {data!r}")                                 # ← new

connection.sendall(b"hello from the server")                       # ← new
print("server: sent a reply")                                       # ← new

connection.close()                                                  # ← new
server_socket.close()                                                # ← new
print("server: closed")                                             # ← new
```

The matching client, typed into a second new throwaway file,
`verification/phase-00/lab_client.py`, shown here in full since nothing
about it was shown in a prior step:

```python
import socket

HOST = "127.0.0.1"
PORT = 5100

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((HOST, PORT))
print(f"client: connected to {HOST}:{PORT}")

client_socket.sendall(b"hello from the client")
print("client: sent a message")

data = client_socket.recv(1024)
print(f"client: received {data!r}")

client_socket.close()
print("client: closed")
```

### Mechanical Walkthrough

- `import socket` — brings in Python's standard library networking
  module; nothing else in this lesson comes from any external package.
- `HOST = "127.0.0.1"` / `PORT = 5100` — plain variables naming the
  address this pair will use. `127.0.0.1` always means "this same
  machine," regardless of what machine runs it.
- `socket.socket(socket.AF_INET, socket.SOCK_STREAM)` (full treatment
  above) — constructs the real socket object each side operates on.
- `server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)`
  — a real, standard configuration call telling the operating system
  it's fine to reuse this exact (host, port) pair immediately, even if
  a previous run of this exact script only just released it; without
  it, quickly re-running this lab could fail with "address already in
  use" for a short period after the last run.
- `server_socket.bind((HOST, PORT))` / `server_socket.listen(1)` (full
  treatment above) — claims the address, then opens it to real
  incoming connections.
- `connection, address = server_socket.accept()` (full treatment
  above) — blocks until `lab_client.py` really connects, then returns
  a connection-specific socket and the real address that connected.
- `connection.recv(1024)` (full treatment above) — reads whatever
  bytes have actually arrived from the client.
- `connection.sendall(b"hello from the server")` (full treatment
  above) — sends a real byte string (Terms, above) back.
- `connection.close()` / `server_socket.close()` — releases both the
  per-connection socket and the original listening socket; after this,
  neither can send, receive, or accept anything further.
- On the client: `client_socket.connect((HOST, PORT))` (full treatment
  above) — the client's half of the real handshake with `accept`.
- `client_socket.sendall(...)` / `client_socket.recv(1024)` — the same
  two calls as the server, used symmetrically to complete the
  exchange.

### Execution Trace

This is a real handshake between two separate processes — the point is
*when* each side's code actually runs relative to the other, not a
value changing across iterations:

1. `lab_server.py` runs `bind` then `listen` — the server is now
   real and addressable, but nothing has connected yet.
2. `lab_server.py` calls `accept()` and blocks — its own execution
   genuinely pauses here; no later line in `lab_server.py` runs until
   something connects.
3. `lab_client.py` starts, separately, and calls `connect(...)` — only
   *this* line, running in the other process, is what makes step 2
   finally return.
4. `lab_server.py`'s `accept()` returns; both processes are now
   running past their respective connection calls, at the same time,
   independently.
5. `lab_client.py` calls `sendall(...)`; moments later (real network
   delivery, not instantaneous even on the same machine),
   `lab_server.py`'s `recv(1024)` returns those exact bytes.
6. The reply travels the same way in reverse: `lab_server.py`'s
   `sendall(...)`, then `lab_client.py`'s `recv(1024)`.
7. Both sides call `close()`, independently, ending the connection.

### CS Lens

This is the **client/server model**: two independent processes,
neither able to call the other's code directly, coordinating through an
explicit, addressable channel instead. Also recognized in: a restaurant
kitchen and its dining room (neither can just walk into the other's
process and grab something — an order slip, the channel, has to pass
between them), a postal system (sender and recipient never touch
directly; an address is the whole coordination mechanism), and every
real network protocol built on top of this one, all the way up through
HTTP, which the next phase of this curriculum studies directly.

### SE Lens

The alternative this lesson deliberately avoids: writing `lab_client.py`
and `lab_server.py` as if they were one program, sharing memory
directly. That alternative is impossible for a real reason, not a
style choice — two separate operating-system processes never share
memory by default, on any real machine. The real cost of the socket
approach actually used here: every value crossing this boundary has to
be explicitly converted to and from bytes (the `b"..."` literals in
this lesson) — nothing crosses this boundary as a native Python object,
ever. Later lessons (JSON, `jsonify`) exist specifically to make that
conversion less error-prone to do by hand, not to remove the need for
it.

### Commands needed

- `python <path>` — runs a script directly with the real Python
  interpreter. Running the server and client as two separate,
  simultaneous invocations (see Verification, below) is what makes this
  lab actually demonstrate two real processes rather than one script
  pretending to be two.

### Verification

Real output from actually running the server as a separate process and
the client against it:

```
=== server output ===
server: listening on 127.0.0.1:5100
server: accepted a connection from ('127.0.0.1', 63819)
server: received b'hello from the client'
server: sent a reply
server: closed
=== client output ===
client: connected to 127.0.0.1:5100
client: sent a message
client: received b'hello from the server'
client: closed
```

The port number in "accepted a connection from" is the client's own
temporary, operating-system-assigned port for this one connection —
not `5100`, since `5100` is the server's fixed, listening port, and the
client's own address only needs to be unique for the duration of this
one exchange. Full saved run:
`verification/phase-00/run_client_server_demo_output.txt`.

### Connection to the previous unit

There is no previous unit — this is the first one in this curriculum.

## Concept Unit: What This Manufacturing Backend Is Actually Responsible For

### The Problem

The lab above proves client/server as a mechanism. But "backend" isn't
just "the server half of a connection" — it's a specific set of
responsibilities. Before reading on: given what a request/response
exchange now concretely is (the lab above), what real jobs would *have*
to exist on the server side of a manufacturing app that tracks parts,
machines, and CAM files — beyond just accepting a connection and
replying?

### Project Change

- **Reference Source:** `package.json:7-8` (the real frontend's dev
  entry point, `"dev": "vite"`); `backend/app/services/gitlab_service.py`
  (a real external-service integration); `backend/config.py`'s
  `UPLOAD_FOLDER`/`STORAGE_PATH` (real filesystem use, already quoted
  in an earlier characterization of this same app).
- **Files affected:** None — this unit is entirely read-only, pointing
  at real, already-existing files to build a mental model, not writing
  or modifying anything.
- **Change type:** None (orientation only).
- **Location:** N/A.
- **Dependencies:** None beyond the real repository already checked
  out on disk.

### The New Code

There is no new code in this unit — every file named below already
exists in the real app. Nothing here gets typed; each is named so it
can be opened and read.

### The Updated Project

Six real responsibilities, each grounded in a real, already-existing
part of this exact application — open each file to see it for real,
don't type any of it:

- **The client half is real and separate.** `package.json`'s own
  `"scripts": {"dev": "vite"}` (already exists) starts the real
  frontend's own dev server — a genuinely different running process
  from the Flask backend, exactly matching the lab above, just with a
  real UI instead of a bare socket exchange.
- **Request handling.** Every file under `backend/app/routes/` (already
  exists) is the real server-side half of that same client/server
  split — code that only ever runs in response to a real incoming
  request, the same shape as `lab_server.py`'s `accept`/`recv`, just
  built on Flask instead of a bare socket.
- **Business logic.** Code that decides *what should happen*,
  independent of HTTP — for example, `backend/app/services/` (already
  exists) holds logic meant to be callable regardless of which route
  triggered it.
- **Persistence.** `backend/app/models/` (already exists) — the real
  boundary where this backend's data outlives any single request or
  process restart.
- **External services.** `backend/app/services/gitlab_service.py`
  (already exists) — real code this backend calls out to a *different*
  real server (GitLab) for, meaning this backend is sometimes a client
  itself, not only a server, exactly matching the lab above's point
  that client/server are roles, not fixed identities.
- **Filesystem.** `backend/config.py`'s `UPLOAD_FOLDER`/`STORAGE_PATH`
  (already exists, already characterized earlier in this
  investigation) — real uploaded files stored outside the database
  entirely, on disk.

### Mechanical Walkthrough

Not applicable in the usual sense — this unit names real, existing
files as evidence rather than walking through a syntactic element in a
new code block. Each bullet above states which real responsibility it
demonstrates and exactly where to find it.

### CS Lens

This is **separation of responsibilities by boundary**: request
handling, business logic, persistence, and external integration are
each a genuinely different *kind* of work, even though all four happen
inside "the backend." Also recognized in: a factory floor's own
division between receiving (intake), machining (transformation),
inventory (storage), and shipping coordination with outside carriers
(external integration) — the same four shapes, in a domain with no
code in it at all.

### SE Lens

`CONCEPT-CATALOG.md`'s own investigation already names the real cost of
*not* keeping these responsibilities separate in this exact app:
`operation_manager.py` mixes export construction, template rendering,
and database access directly inside a route file — one of the clearest
violations of this separation already found in the real codebase. The
alternative this curriculum will actually build toward, later, isn't
"never mix concerns by accident" (too vague to act on) — it's naming
each responsibility explicitly enough that mixing them becomes visible
the moment it happens, the same way this unit just named six of them
concretely instead of leaving "what a backend does" as a vague feeling.

### Commands needed

None — this unit is read-only investigation, no commands run.

### Verification

Not applicable under the Verification Rule's own exemption: every claim
in this unit is a direct citation to a real, already-existing file
(`package.json`, `backend/app/routes/`, `backend/app/services/`,
`backend/app/models/`, `backend/app/services/gitlab_service.py`,
`backend/config.py`), confirmed to exist this session — there is no
execution to run, only files to open and confirm are real, which they
are.

### Connection to the previous unit

The unit above proved client/server as a raw mechanism; this unit
showed that mechanism is only the *shape* of a backend, not its
content — the real content is the six responsibilities just named,
each already visible somewhere in this exact application.

## Connect the pieces

One real exchange, traced end to end: `lab_client.py` opens a real
socket and sends real bytes; `lab_server.py`, a genuinely separate
process, receives them and replies. That raw mechanism is the shape
every request this manufacturing backend ever answers takes, underneath
Flask, underneath HTTP. What makes the real app more than that raw
mechanism is the six responsibilities named in the second unit — a real
frontend as a separate client process, real request-handling routes,
real business logic in services, real persisted data in models, a real
external service call to GitLab, and real files living outside the
database on disk. Every later lesson in this curriculum names one of
those six responsibilities more precisely and rebuilds a real piece of
it.

**Next lesson:** the request/response lifecycle, traced through this
same client/server mechanism, one stage at a time.
