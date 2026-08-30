# Lesson 0.2: Request-to-Response Thinking

*File paths under `backend/...` refer to the real `manufacturing-platform`
repository. Paths under `verification/...` refer to that same
repository's verification folder.*

**What you will build:** A real HTTP request and response, hand-written
as plain text and sent over the exact same raw socket from the previous
lesson — no Flask, nothing hidden. The transferable problem: "HTTP
request" and "HTTP response" sound like special objects a framework
hands you, but underneath, each one is just text, sent and received
through the identical mechanism already proven real. The second half of
this lesson traces one real, concrete request through this
application's actual, full pipeline, end to end.

**What you need to know first:** A raw socket sending and receiving
bytes (client and server as separate processes, `bind`/`listen`/
`accept`/`connect`/`sendall`/`recv`).

## Terms used in this lesson

- **HTTP (HyperText Transfer Protocol)** — a real, plain-text format for
  a request and a response, agreed on so any client and any server,
  written in any language, can understand each other without either
  side needing to know what the other is built in. It exists as an
  agreement on *text layout*, nothing more exotic than that.
- **Request line** — the first line of a real HTTP request:
  `GET /hello HTTP/1.1`, meaning "use the GET method, on the path
  `/hello`, understanding version 1.1 of this text format." It exists
  so the very first bytes a server reads already say what's being
  asked for, before anything else is parsed.
- **Header** (HTTP) — a `Name: value` line following the request or
  status line, carrying metadata about the message rather than its
  actual content. `Host: 127.0.0.1` and `Content-Length: 5` are both
  real headers in this lesson's own lab. Headers exist so information
  *about* the message (its length, its format, which virtual host it's
  for) travels separately from the message's own body.
- **Status line** — the first line of a real HTTP response:
  `HTTP/1.1 200 OK`, meaning "version 1.1 of this format, and here's
  the real outcome, both as a number and a short human-readable word."
  It exists so a client can tell success from failure by reading three
  characters, before parsing anything else.
- **CRLF** (`\r\n`) — the specific two-character sequence HTTP requires
  at the end of every line, and doubled (`\r\n\r\n`) to mark the end of
  all headers, right before the body begins. It exists as an explicit,
  unambiguous line-ending rule — HTTP doesn't leave "end of a line" to
  whatever convention the sender's own operating system happens to use.
- **WSGI (Web Server Gateway Interface)** — a real, standard Python
  contract: a plain function signature any Python web framework can
  implement, and any Python web server can call, so the two can be
  swapped independently. It exists so choosing a framework (Flask,
  another) and choosing a server to run it on (Werkzeug's own dev
  server, Gunicorn, uWSGI) are two separate decisions instead of one
  framework only working with one specific server.
- **Application server** — the real running process that accepts
  actual HTTP connections, parses the raw text (this lesson's own
  Concept Unit 1) into a structured request, and calls the WSGI
  application (the framework) with it. It's the thing standing between
  the raw socket layer already proven real and Flask itself.
- **Routing** — matching a request's method and path against a table of
  registered handlers, then calling the one that matches. It exists
  because a server has no built-in way to know "a GET to `/hello`"
  means "run this specific function" — that mapping has to be built
  and consulted somewhere.
- **Validation** — checking that a request's actual content (its body,
  its query parameters) is well-formed and complete *before* any
  business logic runs on it. It exists so bad input fails fast, at the
  boundary, with a clear reason, instead of causing a confusing failure
  deeper inside the application.
- **Business logic** — the actual decision-making specific to what this
  application does, independent of HTTP entirely — filtering, matching,
  computing. It exists as a named stage because it's the one part of
  the pipeline that's specific to *this* application, not something any
  web framework provides for free.
- **Persistence** — storing data somewhere that outlives the current
  request and the current process, so it's still there the next time
  anyone asks. It exists because everything before it in the pipeline —
  the request, the parsed input, the business logic's own local
  variables — disappears the instant this one request finishes.

## Objects and methods used

- **`socket.socket` / `socket.bind` / `socket.listen` / `socket.accept`
  / `socket.connect` / `socket.sendall` / `socket.recv` / `socket.close`**
  - *What it is:* The same real socket construction and connection
    methods from the previous lesson, reused here for a real HTTP
    exchange instead of an arbitrary message.
  - *Implementation:* `socket.socket(family, type)`; `bind((host,
    port))`; `listen(backlog)`; `accept() -> (connection, address)`;
    `connect((host, port))`; `sendall(data: bytes)`; `recv(bufsize:
    int) -> bytes`; `close()` — identical signatures to their first
    appearance.
  - *Its use:* This lesson's lab builds a server and client exactly as
    before, except the bytes exchanged are now a real, hand-written
    HTTP request and response instead of a plain greeting.
  - *Type:* `socket.socket` is a class; the rest are instance methods
    on the object it constructs (or, for the server, on the connection
    `accept` returns).
  - *Responsibility:* Identical to their first appearance — construct
    a real network endpoint; claim an address and open it to
    connections; block until a real client connects; establish a
    connection from the client side; transmit and receive real bytes;
    release the connection.
  - *Depends on:* The same as before — an address family and type at
    construction; an unclaimed (host, port) for `bind`; a listening
    socket for `accept`; a real, currently-listening server for
    `connect`; an already-connected socket for `sendall`/`recv`.
  - *Connects to:* Exactly as before — `bind`→`listen`→`accept` on the
    server side, `connect` on the client side, `sendall`/`recv` doing
    the actual, symmetric data exchange once connected.
  - *Shape:* The identical low-level seam from the previous lesson —
    this lesson's own point is that HTTP adds nothing new at *this*
    layer; it only defines what the bytes crossing it mean.

- **`str.encode`**
  - *What it is:* A method converting a Python text string into a real
    byte string (Term, previous lesson), using a specified or default
    text encoding.
  - *Implementation:* `str.encode(encoding: str = "utf-8") -> bytes` —
    called here with no argument, using the default.
  - *Its use:* Both the lab's request and response are built as plain
    Python strings first (so the HTTP text layout is readable in the
    source), then converted to real bytes right before `sendall`,
    since a socket can only ever transmit bytes, never a Python `str`
    directly.
  - *Type:* An instance method on `str`.
  - *Responsibility:* Take a sequence of Unicode characters and produce
    the exact sequence of raw bytes that represents them under the
    given encoding — nothing about HTTP is specific to this method; it
    would do the same job for any text.
  - *Depends on:* A `str` value with no characters unrepresentable in
    the chosen encoding.
  - *Connects to:* Its result is passed straight into `sendall`, above.
  - *Shape:* The conversion boundary between "text a person can read in
    the source code" and "the only thing a socket can actually carry."

- **`bytes.decode`**
  - *What it is:* The reverse of `str.encode` — converts raw bytes back
    into a Python text string.
  - *Implementation:* `bytes.decode(encoding: str = "utf-8") -> str`.
  - *Its use:* Both sides of this lab's lab decode what they receive
    via `recv`, purely so the real, raw HTTP text can be printed and
    read directly in Verification, below.
  - *Type:* An instance method on `bytes`.
  - *Responsibility:* Take a sequence of raw bytes and reconstruct the
    exact Unicode text they represent under the given encoding.
  - *Depends on:* Bytes that are actually valid under the chosen
    encoding.
  - *Connects to:* Called on `recv`'s return value, on both sides.
  - *Shape:* The reverse of `str.encode`'s conversion boundary.

## Concept Unit: An HTTP Message Is Just Text

### The Problem

The previous lesson proved a client and server can exchange arbitrary
bytes. "HTTP request" sounds like it should be something more — a real
object with fields, methods, structure. Before reading on: if HTTP
messages travel over the exact same socket already proven real, and a
socket only ever carries bytes, what would the *simplest possible*
real HTTP request look like, written as plain text, by hand?

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch,
  minimal demonstration of the real HTTP text format, one level below
  any real framework.
- **Files affected:** `verification/phase-00/lab_raw_http_server.py`
  and `verification/phase-00/lab_raw_http_client.py` — both created
  (throwaway; discarded from the taught project once understood).
- **Change type:** Add.
- **Location:** New files.
- **Dependencies:** Python's standard library `socket` module only.

### The New Code

New code, typed into a new throwaway file,
`verification/phase-00/lab_raw_http_client.py`:

```python
import socket

HOST = "127.0.0.1"
PORT = 5101

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((HOST, PORT))

request_text = (
    "GET /hello HTTP/1.1\r\n"
    f"Host: {HOST}\r\n"
    "\r\n"
)
client_socket.sendall(request_text.encode())
print("client: raw request sent:")
print(request_text)
```

### The Updated Project

**File:** `verification/phase-00/lab_raw_http_client.py` — the same
file from the step above; everything from `response_bytes = ...`
onward is new, typed in now, marked below:

```python
import socket

HOST = "127.0.0.1"
PORT = 5101

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((HOST, PORT))

request_text = (
    "GET /hello HTTP/1.1\r\n"
    f"Host: {HOST}\r\n"
    "\r\n"
)
client_socket.sendall(request_text.encode())
print("client: raw request sent:")
print(request_text)

response_bytes = client_socket.recv(1024)                          # ← new
print("client: raw response received:")                            # ← new
print(response_bytes.decode())                                     # ← new

client_socket.close()                                               # ← new
```

**File:** `verification/phase-00/lab_raw_http_server.py` — new, shown
here in full since nothing about it was shown in a prior step:

```python
import socket

HOST = "127.0.0.1"
PORT = 5101

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind((HOST, PORT))
server_socket.listen(1)
print(f"server: listening on {HOST}:{PORT}")

connection, address = server_socket.accept()
request_bytes = connection.recv(1024)
print("server: raw request received:")
print(request_bytes.decode())

body = "hello"
response_text = (
    "HTTP/1.1 200 OK\r\n"
    f"Content-Length: {len(body)}\r\n"
    "Content-Type: text/plain\r\n"
    "\r\n"
    f"{body}"
)
connection.sendall(response_text.encode())
print("server: raw response sent:")
print(response_text)

connection.close()
server_socket.close()
```

### Mechanical Walkthrough

- `request_text = "GET /hello HTTP/1.1\r\n" f"Host: {HOST}\r\n" "\r\n"`
  — three real, concatenated string literals: the request line (Terms,
  above), one header (Terms, above), and a final bare `\r\n` with
  nothing before it — the doubled-CRLF (Terms, above) that marks "no
  more headers, nothing else follows in this request."
- `client_socket.sendall(request_text.encode())` (both full treatment
  above) — converts the readable text to real bytes, then transmits
  every one of them.
- `response_bytes = client_socket.recv(1024)` / `response_bytes.decode()`
  (full treatment above) — receives whatever real bytes the server
  sent back, then converts them back to readable text for printing.
- On the server: `request_bytes = connection.recv(1024)` /
  `request_bytes.decode()` — the server's own side of the same
  receive-then-decode pattern, applied to the incoming request instead
  of a reply.
- `body = "hello"` / `response_text = "HTTP/1.1 200 OK\r\n" f"Content-Length:
  {len(body)}\r\n" "Content-Type: text/plain\r\n" "\r\n" f"{body}"` —
  the status line (Terms, above), two headers (one computed from the
  real length of `body`, in characters, not guessed), the doubled-CRLF
  ending the headers, then the real body text itself with no further
  line ending after it.
- `connection.sendall(response_text.encode())` — the server's half of
  the same encode-then-transmit pattern already covered on the client
  side.

### Execution Trace

Identical handshake shape to the previous lesson's client/server lab —
the only real difference is *what* travels over the connection, not
*when* each side's code runs:

1. The server binds, listens, and blocks on `accept()`, exactly as
   before.
2. The client connects, then immediately builds and sends the real
   request text shown above.
3. The server's `recv(1024)` returns that exact text, as bytes; `.decode()`
   turns it back into the readable request line and header shown in
   Verification, below.
4. The server builds a real status line and headers, computing
   `Content-Length` from the real, current length of `body` — not a
   fixed number — then sends the whole response as bytes.
5. The client's `recv(1024)` returns that response; `.decode()` makes
   it readable, printed exactly as it arrived.

### CS Lens

This is a **wire format**: an explicit, agreed-on textual (or binary)
layout for what bytes crossing a real connection mean, independent of
whatever language or library either side happens to be written in.
Also recognized in: email's own `Header: value` format (which HTTP's
header syntax was directly modeled on), a CSV file's comma-and-newline
layout, and JSON itself — a wire format for structured data, covered in
a later phase, sitting *on top of* HTTP's own wire format, not
replacing it.

### SE Lens

The real alternative every production framework actually uses instead
of hand-writing text like this: a real HTTP-parsing library that reads
the raw bytes and hands back a structured object with `.method`,
`.path`, `.headers` already separated out. This lesson deliberately
avoids that library, on purpose, for exactly one lesson — the real
tradeoff: hand-parsing HTTP correctly (this lab's own request has no
body, no query string, no chunked encoding, none of HTTP's real edge
cases) is exactly the kind of code nobody should actually maintain by
hand at any scale, which is precisely why Flask's real request-parsing
code, and the reason it exists, gets a lesson of its own later, once
this raw shape is already understood well enough to see what that
later code is actually saving you from writing.

### Commands needed

- `python verification/phase-00/lab_raw_http_server.py` — run this
  first, in its own terminal; blocks until a client connects.
- `python verification/phase-00/lab_raw_http_client.py` — run this
  second, in a separate terminal, while the server above is still
  running.

### Verification

Real output from actually running the server and client (`\r\n`
renders as a real line break when printed, which is why each header
appears to sit on its own line below):

```
=== server output ===
server: listening on 127.0.0.1:5101
server: raw request received:
GET /hello HTTP/1.1

Host: 127.0.0.1


server: raw response sent:
HTTP/1.1 200 OK

Content-Length: 5

Content-Type: text/plain


hello
=== client output ===
client: raw request sent:
GET /hello HTTP/1.1

Host: 127.0.0.1


client: raw response received:
HTTP/1.1 200 OK

Content-Length: 5

Content-Type: text/plain


hello
```

Both sides agree on exactly the same text, both directions — proof
this is genuinely one shared wire format, not two separate
interpretations that happen to look similar. Full saved run:
`verification/phase-00/run_raw_http_demo_output.txt`.

### Connection to the previous unit

There is no previous unit — this is the first one in this lesson.

## Concept Unit: The Real Pipeline, Traced Through One Concrete Request

### The Problem

The unit above proved what one HTTP message looks like on the wire. A
real request in this manufacturing application passes through several
more real stages before a response comes back. Before reading on: given
what "routing," "validation," "business logic," and "persistence"
(Terms, above) each mean on their own, what real files in this exact
backend would you expect to find each one living in?

```text
client
  ↓
HTTP request
  ↓
web server
  ↓
WSGI/application server
  ↓
Flask
  ↓
routing
  ↓
validation
  ↓
business logic
  ↓
database/external service
  ↓
response
```

Tracing one real, concrete request through every stage — a real
`GET /api/parts` call:

- **client** — the real frontend, started by `package.json`'s
  `"dev": "vite"` script (already cited in the previous lesson) — a
  separate running process from anything below.
- **HTTP request** — a real request line, `GET /api/parts HTTP/1.1`,
  built the same way as this lesson's own Concept Unit 1, just built by
  a browser's networking code instead of by hand.
- **web server / WSGI/application server** — `backend/run.py:19`'s
  real `socketio.run(app, host='0.0.0.0', port=5000, debug=True)` call.
  This app has no separate WSGI server package installed (no Gunicorn,
  no uWSGI, confirmed absent from `backend/requirements.txt`) — the
  application server here *is* the development server Flask/Werkzeug
  provides, run through `socketio.run` instead of plain `app.run`
  because `run.py:2-3`'s `gevent.monkey.patch_all()` and `run.py:19`'s
  `socketio.run` add real-time WebSocket support the plain Flask dev
  server doesn't.
- **Flask** — `backend/app/__init__.py`'s real `create_app()` factory,
  already named in the previous lesson, building the actual running
  application this request reaches.
- **routing** — `backend/app/routes/parts.py`'s real
  `@parts_bp.route('', methods=['GET'])` (line 18), which is what
  decides this specific request is answered by `get_parts`, not any of
  the other functions in that same file.
- **validation** — this specific real request has none: `get_parts`
  (lines 20-55) reads two optional query parameters (`status`,
  `search`) and never rejects the request for missing or malformed
  input. Not every real request passes through every named stage —
  this is one, real, honest example of that.
- **business logic** — `parts.py:34-47`'s real filtering logic,
  building up a query conditionally based on which query parameters
  were actually given.
- **database** — `parts.py:35,50`'s real `Part.query`, filtered and
  then executed with `.all()` — the real, persistent data this request
  actually reads. (What `Part.query` and `.all()` really are, in full,
  is this curriculum's own SQLAlchemy phase, later — not explained
  further here.)
- **response** — `parts.py:52-55`'s real `jsonify({...})` call, the
  same real function already given full treatment in the previous
  lesson's Concept Unit — converting the real, queried data back into
  the same kind of HTTP response this lesson's own Concept Unit 1
  built by hand.

### Project Change

- **Reference Source:** `backend/run.py:1-19` (quoted above);
  `backend/app/routes/parts.py:18-55` (quoted above) — both real,
  already-existing files, quoted verbatim, read this session.
- **Files affected:** None — this unit is entirely read-only.
- **Change type:** None (orientation only).
- **Location:** N/A.
- **Dependencies:** None beyond the real repository already checked
  out on disk.

### The New Code

There is no new code in this unit — every file named above already
exists. Nothing here gets typed.

### The Updated Project

Not applicable — this unit cites real, existing files rather than
building up a new one; see the trace above for exactly where each
stage lives.

### Mechanical Walkthrough

Not applicable in the usual sense — this unit names real, existing
files and lines as evidence for each pipeline stage, the same way the
previous lesson's second unit did, rather than walking through a new
syntactic element.

### CS Lens

This is a **pipeline architecture**: a fixed sequence of stages, each
one handing its output to the next, none of them needing to know how
any other stage does its own job internally. Also recognized in: a
factory assembly line (each station only knows what arrives and what
must leave, not how the previous station built it), a compiler's own
real stages (lexing, parsing, analysis, code generation), and a Unix
shell pipe (`a | b | c`, each program only reading stdin and writing
stdout, oblivious to what's on the other end of either).

### SE Lens

The real, honest cost this specific example already exposed: not every
stage in the named pipeline is actually present for every real request
— `GET /api/parts` has no validation stage at all. The alternative
this curriculum won't take: pretending every request uniformly touches
every stage, which would misrepresent this real application's actual
shape. The pipeline names the *stages that can exist*, not a guarantee
that each one always does — a lesson later in this curriculum, once
validation is taught properly, will show a real request that *does*
have one, and the contrast will be exactly this absence, made concrete.

### Commands needed

None — this unit is read-only investigation, no commands run.

### Verification

Not applicable under the Verification Rule's own exemption: every claim
in this unit is a direct citation to real, already-existing files
(`backend/run.py`, `backend/app/routes/parts.py`, `backend/requirements.txt`),
confirmed to exist and read verbatim this session — there is no
execution to run.

### Connection to the previous unit

The unit above proved what one HTTP message looks like, in isolation,
built by hand; this unit showed that same message, in a real request,
passing through six more real, named stages before a response comes
back — most of them absent from the raw lab entirely, since a bare
socket exchange has no routing table, no query parameters, and nothing
persisted anywhere.

## Connect the pieces

One concrete request, traced completely: a real `GET /api/parts` call
starts as a request line and headers — exactly the same shape this
lesson's own Concept Unit 1 built by hand — sent from a real, separate
frontend process, received by `backend/run.py`'s real application
server, handed to the real Flask app `create_app()` builds, matched by
`parts_bp`'s real routing to `get_parts`, which (this specific request
having no validation stage) runs real business logic filtering a real
`Part.query`, and returns a real `jsonify`-built response — the same
wire format, and the same `jsonify` function, already proven real in
this lesson's own hand-built exchange.

**Next lesson:** the application's own boundaries — where transport,
application logic, and persistence are meant to stay separated, and
where, in this real backend, they currently aren't.
