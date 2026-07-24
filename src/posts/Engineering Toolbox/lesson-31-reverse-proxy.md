# Lesson 31: The Program in the Middle

## What you will build

A reverse proxy: a program that sits between clients and one or more real
backend servers, forwards each request to the right backend based on the
request's path, and relays the response back — while the client never
knows it wasn't talking to a real server the whole time. The transferable
problem this lesson is actually about: a single program can hold a
socket connection open in **two directions at once**, acting as a server
to one peer and a client to another, simultaneously — and once that idea
clicks, an enormous amount of real infrastructure (load balancers, API
gateways, CDNs) turns out to be a variation on exactly this shape.

## What you need to know first

- **Lesson 18** — `socket()`, `bind()`, `listen()`, `accept()`,
  `connect()`, `send()`/`recv()`. Today's proxy uses `accept()` on one
  socket and `connect()` on a second, different socket, inside the same
  program — both already-known operations, just combined in a new way.
- **Lesson 20** — thread-per-connection servers and why a shared
  connection needs care when multiple threads touch it (not directly
  reused today, since nothing here is shared across threads, but the
  overall shape is the same).
- **Lesson 24 and Lesson 29** — raw HTTP request/response text, and
  parsing it into a request line and a headers dictionary by hand.
  Today's proxy reuses that exact parsing approach.

---

## The Problem, in prose, no code yet

Lesson 25 built a tiny web server: a client connects directly to it, and
it answers directly. That's the entire relationship — one client, one
server, one socket on each end, talking straight to each other.

Real deployments almost never look like that. A company might run three
different backend services — one for its website, one for its API, one
for image uploads — but wants visitors to reach all three through a
single address, `example.com`, with the routing to the correct internal
service invisible to the outside world. Or it might run five identical
copies of the same backend for capacity, and needs something to decide
which copy handles each incoming request. Both of these need a program
that isn't the real destination, but stands in front of it, forwards
traffic transparently, and can also *change* something about the traffic
in transit. That program is a reverse proxy — "reverse" because, unlike a
proxy a client configures on purpose to reach the outside world, a
reverse proxy is configured by the server side, and the client usually
has no idea it exists.

---

## Concept Unit: A Program Can Be a Server and a Client at Once

### The Problem

Every socket program built so far in this curriculum has played exactly
one role: Lessons 18–20 wrote servers (`bind`/`listen`/`accept`), Lesson
24 wrote a client (`connect`). A reverse proxy needs to be both, in the
same running process, for the same request: it must `accept()` a
connection the way a server does, and then, before it can answer,
`connect()` out to a real backend the way a client does — using a
completely separate second socket, not the one the real client is
connected through.

### Reference Source

No reference counterpart — this curriculum has no external reference
implementation it's building toward. This unit's shape follows the
general reverse-proxy architecture described in RFC 7230 §2.3's
definition of an intermediary, not any specific codebase.

### Introduce the concept in isolation

A disposable stand-in, with no HTTP or routing anywhere in it — just
proving that one program can hold both roles open at the same time and
move bytes between them:

```python
import socket
import threading

def run_echo_backend(listen_port):
    backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    backend_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    backend_socket.bind(("localhost", listen_port))
    backend_socket.listen()
    connection, _ = backend_socket.accept()
    data = connection.recv(4096)
    connection.sendall(b"ECHO:" + data)
    connection.close()

def run_relay(listen_port, backend_port):
    relay_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    relay_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    relay_socket.bind(("localhost", listen_port))
    relay_socket.listen()
    client_connection, _ = relay_socket.accept()   # relay acting as a server

    backend_connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    backend_connection.connect(("localhost", backend_port))  # relay acting as a client

    data_from_client = client_connection.recv(4096)
    backend_connection.sendall(data_from_client)
    data_from_backend = backend_connection.recv(4096)
    client_connection.sendall(data_from_backend)
```

Run it (full script including a real client, in the repository as
`lab_relay.py` for this unit only):

```
client received: b'ECHO:hello through the relay'
```

What this proves: `run_relay` never touches the *content* the client
sent — it received `b"hello through the relay"` on `client_connection`
and handed those exact bytes to `backend_connection.sendall()` without
inspecting them at all, then did the reverse for the reply. Two
independent `socket` objects, one from `accept()` and one from
`connect()`, existing in the same function at the same time, is the
entire concept — nothing about `socket()`, `bind()`, `connect()`, or
`recv()`/`sendall()` here is new syntax; what's new is only that this
program is deliberately holding both a server-side and a client-side
connection open together and manually moving data between them.

This lab is deleted now; it never appears in the project. The relay
shape survives, generalized next into something that works for
connections of any length.

### CS Lens

This is a program acting as an **intermediary** in a request/response
chain — RFC 7230's own term for exactly this role. Structurally, it's
also the simplest possible instance of a **pipe**: two ends, with
something in the middle moving data from one to the other unchanged.

Also recognized in: Unix's own `|` shell pipe (Lesson 3's territory,
revisited here at the network layer instead of the process layer), SSH
port forwarding, VPN tunneling, `netcat`'s `-e` relay mode.

### SE Lens

The alternative to a reverse proxy is giving every client direct network
access to every backend server. That's simpler — no extra hop, no extra
program to run — but it means every backend must be independently
reachable from outside, independently secured, and independently
addressed; changing which physical machine runs a backend means updating
every client. A reverse proxy trades one extra network hop (and one more
program that can itself become a bottleneck or a single point of failure)
for a single stable address clients depend on, while everything behind it
can change freely. This is the same **indirection** tradeoff that showed
up as dependency inversion in earlier object-oriented lessons, just at
the network layer instead of the code layer.

---

## Concept Unit: Relaying a Connection of Unknown Length

### The Problem

The lab above worked because it assumed exactly one `recv()` and exactly
one `sendall()` in each direction — fine for a toy echo, but a real HTTP
response can arrive in several chunks, and the relay has no way to know
in advance how many. It needs to keep forwarding bytes for as long as
there are bytes to forward, in both directions, independently — the
client might still be sending while the backend is already replying.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `reverse_proxy.py`.
- **Change type:** add.
- **Dependencies:** `socket`, `threading` — both standard library, both
  already used in Lesson 20.

### The New Code

```python
def relay(source_socket, destination_socket):
    while True:
        chunk = source_socket.recv(4096)
        if not chunk:
            break
        destination_socket.sendall(chunk)
    destination_socket.shutdown(socket.SHUT_WR)
```

### The Updated Project

This is a new, freestanding function with nothing surrounding it yet, so
per the schema's own exception, there is no larger enclosing structure to
show — Project Change above already states exactly where it lives.

### Mechanical Walkthrough

- `while True:` — reused control flow (first taught back in Lesson 1's
  command loop): keep relaying indefinitely, since neither side tells the
  relay in advance how much data is coming.
- `source_socket.recv(4096)` — reused from every socket lesson since 18.
  The key fact being leaned on here, restated because it's easy to
  forget: `recv()` returns however many bytes happen to be available up
  to the requested maximum, not necessarily a complete message — which is
  exactly why this loop can't assume one `recv()` equals one full
  response.
- `if not chunk: break` — an empty `bytes` object (`b""`) is falsy in
  Python, reused from earlier conditionals; `recv()` returning `b""`
  specifically means "the other side closed its end of the connection,"
  which is the loop's only exit condition.
- `destination_socket.sendall(chunk)` — reused; forwards exactly what was
  just received, unmodified, to the other socket.
- `destination_socket.shutdown(socket.SHUT_WR)` — **first appearance.**
  `shutdown()` half-closes a socket: `SHUT_WR` specifically tells the
  operating system "I am done *sending* on this socket" without closing
  it entirely, so the other side still receives a clean end-of-data
  signal (its own `recv()` will return `b""`) even though this program
  might still be reading a reply from somewhere else on the same socket
  object. This matters because the proxy will run `relay()` in both
  directions concurrently in a real bidirectional case — closing the
  socket outright here would break the other direction's still-active
  `recv()`.

### CS Lens

This loop is a **streaming copy** — moving data in bounded chunks rather
than requiring the whole message to exist in memory at once, the same
principle that lets a video streaming service send a movie without
downloading the entire file first.

Also recognized in: Unix's `cat`/`cp` implementations under the hood
(Lessons 9–10's `ls`/`cat` did the same thing for files instead of
sockets), video and audio streaming protocols, any file upload/download
progress bar (which only exists because the transfer happens in
observable chunks, not one atomic step).

### SE Lens

`relay()` deliberately knows nothing about HTTP — no parsing, no
headers, nothing but raw bytes. That's the open/closed principle from
earlier lessons applied here: this function works unmodified whether the
traffic behind it is HTTP, the raw chat protocol from Lesson 20, or
Lesson 30's WebSocket frames, because it never opens the envelope to look
at what's inside. The cost of that generality: `relay()` alone cannot
make a routing decision, since making a decision like "which backend
should this go to" requires reading the very content this function is
designed not to look at. The next unit has to peel that decision out into
its own step, before `relay()` ever runs.

---

## Concept Unit: Choosing a Backend by Path

### The Problem

A reverse proxy that only ever forwards to one fixed backend is really
just the relay lab with better plumbing. What makes it a genuine *reverse
proxy* rather than a dumb pipe is a routing decision: given the path the
client requested, decide which of several real backends should actually
handle it — `/api/...` might go to one service, everything else to
another.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `reverse_proxy.py`.
- **Change type:** add.
- **Location:** above `relay()`.

### The New Code

```python
ROUTING_TABLE = {
    "/api": ("localhost", 9001),
    "/": ("localhost", 9000),
}


def choose_backend(request_path):
    matching_prefixes = [
        prefix for prefix in ROUTING_TABLE if request_path.startswith(prefix)
    ]
    longest_matching_prefix = max(matching_prefixes, key=len)
    return ROUTING_TABLE[longest_matching_prefix]
```

### The Updated Project

This is a new, freestanding pair of definitions with nothing surrounding
them yet — no Updated Project step needed beyond the Project Change
location stated above.

### Mechanical Walkthrough

- `ROUTING_TABLE = {...}` — an ordinary `dict`, reused syntax, mapping a
  path prefix (`str`) to a `(host, port)` tuple — the exact two-value
  shape `connect()` already expects, chosen deliberately so this value can
  be passed straight into `connect()` later without reshaping it.
- `[prefix for prefix in ROUTING_TABLE if request_path.startswith(prefix)]`
  — a **hard concept reappearing**: list comprehension, already used in
  Lessons 12–13's file-search work. `.startswith()` is reused string
  matching from those same lessons.
- `max(matching_prefixes, key=len)` — **first appearance of `max()`'s
  `key` argument** in this curriculum. Plain `max("a", "ab")` would
  compare strings alphabetically; `key=len` tells `max()` to compare each
  candidate by the result of calling `len()` on it instead — here, the
  *length* of each matching prefix. This is necessary because `/api`
  matches both the `"/api"` entry and the `"/"` entry (every path starts
  with `/`), and the routing rule this lesson wants is "the most specific
  match wins" — the longest matching prefix, exactly the rule real
  reverse proxies like nginx use for `location` blocks.

### CS Lens

This is **longest-prefix matching** — the exact same algorithm class that
decides IP routing table lookups (where the most specific matching subnet
wins) and how a filesystem resolves overlapping mount points.

Also recognized in: nginx and Apache's own `location`/`Location`
directive matching, CDN edge-routing rules, DNS zone delegation (more
specific subdomains override broader ones).

### SE Lens

A dictionary-driven routing table, checked at request time, means adding
a new backend is a one-line change to `ROUTING_TABLE` with no changes
anywhere else in the program — an application of the same open/closed
principle named in the previous unit, now applied to configuration
instead of code. The alternative — an `if path.startswith("/api"): ...
elif path.startswith("/other"): ...` chain — would work for two routes
but becomes an increasingly fragile wall of conditionals as routes grow,
and unlike the dictionary form, nothing would enforce "longest match
wins" automatically; each new route would need its ordering reasoned
about by hand.

---

## Concept Unit: Rewriting the Request Before Forwarding

### The Problem

A blind `relay()` forwards the client's request byte-for-byte — including
a `Host` header that names the *proxy's* address, since that's what the
client actually connected to, not the backend's. Sent unmodified to a
backend expecting its own hostname, that's at best confusing and at worst
breaks backends that use `Host` to decide how to respond. On top of that,
the backend has no way to know the original client's real IP address —
every connection it sees appears to come from the proxy itself, since
that's who actually opened the socket to it.

### Project Change

- **Reference Source:** No reference counterpart — the `X-Forwarded-For`
  header name follows the de facto standard documented in RFC 7239.
- **Files affected:** `reverse_proxy.py`.
- **Change type:** add.
- **Location:** below `choose_backend`, reusing the request-parsing
  approach from Lesson 24/29.

### The New Code

```python
def parse_request_line_and_headers(request_text):
    lines = request_text.split("\r\n")
    request_line = lines[0]
    method, path, http_version = request_line.split(" ")
    headers = {}
    for line in lines[1:]:
        if ": " in line:
            key, value = line.split(": ", 1)
            headers[key] = value
    return method, path, http_version, headers


def build_forwarded_request(method, path, http_version, headers, backend_host, backend_port, client_address):
    headers["Host"] = f"{backend_host}:{backend_port}"
    headers["X-Forwarded-For"] = client_address[0]
    header_lines = "\r\n".join(f"{key}: {value}" for key, value in headers.items())
    return f"{method} {path} {http_version}\r\n{header_lines}\r\n\r\n"
```

### The Updated Project

Two new, freestanding functions with nothing surrounding them yet — the
Project Change section above already states where each lives.

### Mechanical Walkthrough

- `request_text.split("\r\n")` and the header-splitting loop — a **hard
  concept reappearing**, identical to Lesson 30's `parse_handshake_headers`
  and Lesson 24's original response parsing.
- `request_line.split(" ")` — **first appearance of unpacking a split
  result directly into three names.** `"GET /hello HTTP/1.1".split(" ")`
  produces the list `["GET", "/hello", "HTTP/1.1"]`; assigning it to
  `method, path, http_version` in one line works because Python unpacks a
  list into multiple variables when the counts match exactly — the same
  mechanism behind `for index, byte in enumerate(...)` from Lesson 30,
  applied here to a plain list instead of `enumerate`'s pairs.
- `headers["Host"] = ...` — reused dictionary assignment; overwrites
  whatever `Host` value the client originally sent (the proxy's own
  address) with the backend's real address, since a `dict` key can only
  hold one value and assigning to an existing key replaces it.
- `headers["X-Forwarded-For"] = client_address[0]` — same dictionary
  assignment, adding a header the original request never had.
  `client_address` is the `(host, port)` tuple `accept()` already returns
  (known since Lesson 18); `[0]` takes just the IP address, discarding
  the client's ephemeral source port, which the backend has no use for.
- `"\r\n".join(f"{key}: {value}" for key, value in headers.items())` — a
  **hard concept reappearing**: `.items()` and `.join()` with a generator
  expression, both used in earlier lessons' text-building code (Lesson 29
  built response headers the same way, in the send direction rather than
  the receive-then-resend direction used here). Rebuilding the entire
  header block from the dictionary — rather than trying to edit the
  original text in place — is deliberate: a dictionary has no fixed
  order or original formatting to preserve, so reconstructing it fresh is
  simpler and less error-prone than string-splicing the original text.

### CS Lens

This is **message transformation at a trust boundary** — the proxy sits
between two parties that don't fully trust or know about each other, and
part of its job is adjusting the message so each side sees what it needs
to see, not what the other side actually sent.

Also recognized in: network address translation (NAT) rewriting source
IPs on outgoing packets, API gateways stripping internal auth tokens
before forwarding externally, compilers inserting bounds-checks a
programmer never wrote.

### SE Lens

`X-Forwarded-For` is not part of core HTTP — RFC 7239 standardizes it
specifically because so many real deployments needed exactly this
information and converged on the same informal header name before it was
ever formalized. The design tradeoff worth naming honestly: nothing
stops a malicious client from sending its own fake `X-Forwarded-For`
header before it even reaches this proxy — this implementation
overwrites the client's `Host` but not an existing `X-Forwarded-For`, so
a backend trusting this header from an internet-facing proxy without
further validation would be trusting attacker-controlled input. A
production proxy either strips any client-supplied value first or only
trusts this header when it's the proxy itself, not the client, appending
to it — real debt worth naming, not silently avoided by the example
inputs this lesson happens to test with.

---

## Concept Unit: Assembling the Request Handler

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `reverse_proxy.py`.
- **Change type:** add.
- **Location:** below `build_forwarded_request`.
- **Dependencies:** every function built in this lesson so far.

### The New Code

```python
def handle_client(client_socket, client_address):
    request_bytes = client_socket.recv(4096)
    request_text = request_bytes.decode("utf-8")
    method, path, http_version, headers = parse_request_line_and_headers(request_text)

    backend_host, backend_port = choose_backend(path)
    forwarded_request = build_forwarded_request(
        method, path, http_version, headers, backend_host, backend_port, client_address
    )

    backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    backend_socket.connect((backend_host, backend_port))
    backend_socket.sendall(forwarded_request.encode("utf-8"))

    relay(backend_socket, client_socket)
    client_socket.close()
    backend_socket.close()


def main():
    proxy_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    proxy_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    proxy_socket.bind(("localhost", 8080))
    proxy_socket.listen()
    print("Reverse proxy listening on localhost:8080")
    while True:
        client_socket, client_address = proxy_socket.accept()
        thread = threading.Thread(
            target=handle_client, args=(client_socket, client_address), daemon=True
        )
        thread.start()


if __name__ == "__main__":
    main()
```

### Mechanical Walkthrough

- The first four lines of `handle_client` are the Concept Units above,
  applied in sequence: parse, then route, then rewrite. Nothing new here
  syntactically — this is the return step showing how the previously
  separate pieces compose.
- `backend_socket.connect((backend_host, backend_port))` — this is the
  moment `choose_backend`'s `(host, port)` tuple gets used exactly as
  planned: `connect()` (reused from Lesson 24) takes precisely that
  two-value shape as its argument.
- `relay(backend_socket, client_socket)` — this call only relays
  **backend → client**, deliberately one direction, not both. Because the
  full request was already sent in one `sendall()` above rather than
  streamed, and this lesson's test traffic is a single request per
  connection with no request body, there's no ongoing client → backend
  traffic left to relay by this point — unlike the WebSocket case in
  Lesson 30, or a real HTTP `POST` with a large body, where a
  bidirectional relay using two threads (as the isolated lab
  demonstrated) would be necessary. This is a real, named simplification:
  this proxy handles simple GET-style requests correctly, but a large
  request body arriving after the first `recv(4096)` would be silently
  dropped.
- `client_socket.close()` / `backend_socket.close()` — reused; both
  sockets are done once the response has been fully relayed.
- `main()` — this is a **hard concept reappearing**, structurally
  identical to Lesson 20's and Lesson 30's server loop: `accept()`, spawn
  a `daemon=True` thread per connection, loop forever. No new explanation
  owed beyond naming the reuse.

### Run it

Two backends and the proxy, all started, then two real requests sent
through the proxy — one to `/hello` (no matching specific prefix, falls
through to the `/` route) and one to `/api/users` (matches the more
specific `/api` route):

```
=== request to / ===
HTTP/1.1 200 OK
Content-Length: 118
Connection: close

default-backend received:
GET /hello HTTP/1.1
Host: localhost:9000
Connection: close
X-Forwarded-For: 127.0.0.1

=== request to /api ===
HTTP/1.1 200 OK
Content-Length: 118
Connection: close

api-backend received:
GET /api/users HTTP/1.1
Host: localhost:9001
Connection: close
X-Forwarded-For: 127.0.0.1
```

Both responses prove three things at once, straight from the backend's
own mouth: `/hello` was routed to `default-backend` on port 9000 while
`/api/users` was routed to `api-backend` on port 9001 (the routing
table's longest-prefix rule worked); `Host` arrived at each backend as
that backend's own address (`localhost:9000` / `localhost:9001`), not the
proxy's `localhost:8080` the test client actually connected to (the
rewrite worked); and `X-Forwarded-For: 127.0.0.1` arrived at both
backends even though neither backend has a direct connection to the real
client (the proxy added information the backend could never have
obtained on its own).

---

## Connect the pieces

One request, traced through every unit built today: a client sends
`GET /api/users HTTP/1.1` to the proxy on port 8080.

1. `main()`'s `accept()` returns a new `client_socket`; `handle_client`
   starts on its own thread.
2. `client_socket.recv(4096)` reads the raw request bytes;
   `parse_request_line_and_headers` turns them into `method="GET"`,
   `path="/api/users"`, and a `headers` dict.
3. `choose_backend("/api/users")` finds two candidate prefixes (`"/api"`
   and `"/"`), picks the longer one, and returns `("localhost", 9001)`.
4. `build_forwarded_request` overwrites `Host` to `"localhost:9001"`,
   adds `X-Forwarded-For: 127.0.0.1`, and reassembles the full request
   text.
5. A brand-new `backend_socket` connects to `("localhost", 9001)` — the
   proxy briefly becomes a client, exactly as the first Concept Unit
   described — and sends the rewritten request.
6. `relay(backend_socket, client_socket)` streams the backend's response
   back to the original client, chunk by chunk, until the backend closes
   its end.

## What breaks without this

Comment out the `headers["Host"] = f"{backend_host}:{backend_port}"` line
in `build_forwarded_request` and resend the `/api/users` request:

```
api-backend received:
GET /api/users HTTP/1.1
Host: localhost:8080
Connection: close
X-Forwarded-For: 127.0.0.1
```

The request still succeeds against this test backend, because it doesn't
actually branch on `Host` — but the header now falsely claims the backend
is `localhost:8080`, the *proxy's* address, not its own. A real backend
that uses `Host` to build absolute URLs in its own responses (a common
pattern), or that hosts multiple sites and picks which one to serve based
on `Host`, would now misbehave — generating broken links or serving the
wrong site entirely, silently, with no error anywhere in the chain.
Restoring the line fixes it.

## Definition of done

- [ ] `reverse_proxy.py` runs and prints `Reverse proxy listening on
      localhost:8080`.
- [ ] A request to a path with no specific route (e.g. `/hello`) is
      forwarded to the `/` entry in `ROUTING_TABLE`.
- [ ] A request to `/api/...` is forwarded to the `/api` entry instead,
      proving longest-prefix matching, not just dictionary order.
- [ ] The backend's received `Host` header matches the backend's own
      address, not the proxy's.
- [ ] The backend's received headers include a correct `X-Forwarded-For`.
- [ ] You can explain, without looking back at this lesson, why
      `relay()` is only called in one direction here but would need two
      threads for Lesson 30's WebSocket traffic.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add reverse_proxy.py
  git commit -m "Add path-routed reverse proxy — one program acting as both server (to the client) and client (to a backend), rewriting Host and adding X-Forwarded-For so backends never need direct client exposure"
  ```

## What's next

This proxy makes exactly one routing decision per path and never
reconsiders it — every `/api` request always goes to the same single
backend. Lesson 32's rate limiter and any future load-balancing lesson
both extend this same `handle_client` shape: a rate limiter would check a
request against a counter before ever calling `choose_backend`; a load
balancer would turn `ROUTING_TABLE`'s single `(host, port)` per prefix
into a list, with logic for picking one entry from it on each request
instead of always the same one.
