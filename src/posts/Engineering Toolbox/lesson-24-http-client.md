# Lesson 24: HTTP Is Just Text Over a Socket
### (HTTP Client From Raw Sockets, Then Compared Against `requests`)

**What you will build.** `http_get(host, port, path)` — a real HTTP
client, built entirely from Lesson 18's raw socket primitives, with no
HTTP library at all. It sends a real, hand-written HTTP request over a
plain TCP socket and parses a real response back into a status line,
headers, and body. Then, the same request is repeated using Python's
`requests` library, against the identical server, to see exactly what a
"real" HTTP library does differently — including a real bug this
lesson's hand-built version has and `requests` doesn't.

**Pipeline so far:** unchanged — `Program → Socket → Network → Socket
→ Program` — HTTP, this lesson's whole point, turns out to be nothing
more than a specific, agreed-upon *text format* sent through exactly
the socket machinery already built in Lesson 18.

**What you need to know first.** From Lesson 18: creating a socket,
`connect()`, `sendall()`, `recv()`. New in this lesson: nothing at the
socket level — this lesson is entirely about a text *protocol* built on
top of sockets you already know how to use.

**An honesty note.** This sandbox's network rules block outbound
connections to arbitrary external hosts, so instead of testing against
a real public website, this lesson builds its own small, real HTTP
server (reusing Lesson 19's server shape) to test against — genuine
HTTP traffic, just staying local. Everything shown, including the final
comparison against `requests`, ran for real.

---

## Concept Unit: HTTP as a Text Format

### The Problem

Every network exchange so far in this curriculum has used a format this
curriculum invented for itself — plain bytes, whatever shape a given
lesson chose. HTTP is different: it's a real, standardized text format
that a huge amount of the internet agrees on, and understanding it
means understanding that agreement, not writing new code.

### Introduce the Concept in Isolation

```python
request = (
    "GET / HTTP/1.1\r\n"
    "Host: 127.0.0.1\r\n"
    "Connection: close\r\n"
    "\r\n"
)
print(repr(request))
```

Run it:

```
'GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n'
```

This proves an HTTP request is genuinely just text, in a specific
shape: a request line (method, path, protocol version), one or more
header lines, each ending in `\r\n` (carriage return + newline — HTTP's
specified line ending, not just `\n`), and a **blank line** (`\r\n\r\n`
— two line endings back to back) marking where headers end. Nothing
here is binary or encoded specially — it's exactly what it looks like.
This throwaway example is discarded; the real project sends this text
over a genuine socket.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `http_client.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket` module; a real HTTP server to connect to
  (this lesson's own `tiny_http_server.py`, built alongside it)

### The New Code

```python
import socket

def http_get(host, port, path):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        request = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            f"Connection: close\r\n"
            f"\r\n"
        )
        s.sendall(request.encode())
```

### The Updated Project

```python
import socket

def http_get(host, port, path):                        # ← new
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:  # ← new
        s.connect((host, port))                              # ← new
        request = (                                              # ← new
            f"GET {path} HTTP/1.1\r\n"                              # ← new
            f"Host: {host}\r\n"                                       # ← new
            f"Connection: close\r\n"                                    # ← new
            f"\r\n"                                                       # ← new
        )                                                                   # ← new
        s.sendall(request.encode())                                          # ← new
```

The function now sends a real, complete, correctly-formatted HTTP
request over a genuine socket — but doesn't yet read or make sense of
whatever comes back.

### Mechanical Walkthrough
`import socket`, `with socket.socket(...) as s:`, `s.connect((host,
- port))` — all direct reminders of Lesson 18, unchanged.
- `request = (...)` — the concept from this unit's lab, reused for real, with

`host`/`path` now genuine parameters instead of hardcoded values.
- `s.sendall(request.encode())` — Lesson 19's `sendall()` reminder, combined with `.encode()` (Lesson 1, reminder) — the request, built as

a Python `str`, has to become `bytes` before a socket will send it, the
identical text/bytes boundary Lesson 1 first established.

### CS Lens

This is the real, concrete meaning of "HTTP is built on top of TCP":
HTTP defines *what text to send and expect*; TCP (Lesson 18's sockets)
handles actually getting that text from one machine to another,
reliably and in order. Also recognized in: SMTP (email) and FTP, both
similarly plain-text protocols built the same way, historically — HTTP
isn't unique in this, it's a widely-used example of a broader pattern.

### SE Lens

`"Connection: close"` is a deliberate choice here, not incidental — it
tells the server "close the connection once you've sent your response,"
which makes reading the response back dramatically simpler (the next
unit reads until the connection closes). Real HTTP servers commonly
default to keeping connections open instead (for reusing one connection
across multiple requests, avoiding repeated handshake overhead) — this
lesson's closing section demonstrates, for real, exactly what goes
wrong when a client naively assumes the connection will close and it
doesn't.

### Commands Needed

None yet.

### Run It

Not runnable for meaningful output yet — the request is sent, but
nothing reads the reply.

### Connection

We can send a real, valid HTTP request. The next unit reads and parses
what comes back.

---

## Concept Unit: Reading Until Close, and Splitting Headers from Body

### The Problem

The response, like the request, is just text — but it arrives as a
stream of bytes over the socket, possibly in multiple pieces (Lesson
10's chunked-reading lesson applies here too), and it has its own
structure: a status line, headers, then a blank line, then the actual
body content.

### Introduce the Concept in Isolation

```python
response = b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 61\r\nConnection: close\r\n\r\n<html><body><h1>Hello from the tiny server</h1></body></html>\n"

header_part, body_part = response.split(b"\r\n\r\n", 1)
print("--- headers ---")
print(header_part.decode())
print("--- body ---")
print(body_part.decode())
```

Run it:

```
--- headers ---
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 61
Connection: close
--- body ---
<html><body><h1>Hello from the tiny server</h1></body></html>
```

This proves `response.split(b"\r\n\r\n", 1)` — `.split()` on `bytes`
(same idea as `str.split()`, applied here to raw bytes) with a `1` as
the second argument (splitting at most once, keeping everything after
the first match together as the body, even if the body itself happens
to contain that exact byte sequence again) — cleanly separates
everything HTTP considers "metadata" from everything it considers
"content." This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `http_client.py`
- **Change type:** add — completes `http_get()`
- **Location:** inside `http_get()`, after `sendall()`
- **Dependencies:** `s`

### The New Code

```python
response = b""
while True:
    chunk = s.recv(4096)
    if not chunk:
        break
    response += chunk

header_part, body_part = response.split(b"\r\n\r\n", 1)
header_lines = header_part.decode().split("\r\n")
status_line = header_lines[0]

headers = {}
for line in header_lines[1:]:
    key, value = line.split(": ", 1)
    headers[key] = value

return status_line, headers, body_part
```

### The Updated Project

```python
import socket

def http_get(host, port, path):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        request = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            f"Connection: close\r\n"
            f"\r\n"
        )
        s.sendall(request.encode())

        response = b""                                    # ← new
        while True:                                          # ← new
            chunk = s.recv(4096)                                # ← new
            if not chunk:                                          # ← new
                break                                                 # ← new
            response += chunk                                          # ← new

    header_part, body_part = response.split(b"\r\n\r\n", 1)          # ← new
    header_lines = header_part.decode().split("\r\n")                  # ← new
    status_line = header_lines[0]                                        # ← new

    headers = {}                                                            # ← new
    for line in header_lines[1:]:                                            # ← new
        key, value = line.split(": ", 1)                                       # ← new
        headers[key] = value                                                     # ← new

    return status_line, headers, body_part                                         # ← new
```

`http_client.py` is now complete: `http_get()` sends a real request and
returns a genuinely parsed status line, a headers dictionary, and the
raw body — all from a hand-built HTTP client with no library help.

### Mechanical Walkthrough
- `while True: chunk = s.recv(4096) ...` — Lesson 19's `recv()`-until-
empty pattern, reminder — here reading the *entire* response, relying
specifically on the server closing the connection (per
`"Connection: close"`, sent in the request) to know when to stop; this
reliance is exactly what the closing section shows breaking. `response
- .split(b"\r\n\r\n", 1)` — the concept from this unit's lab, reused for real.
- `header_part.decode().split("\r\n")` — `.decode()` (Lesson 1, reminder) then `.split("\r\n")` — turning the header block into one line per header.
- `status_line = header_lines[0]` — the very first line

is always the status line, by the format's own definition. `for line in
- header_lines[1:]:` — slicing (Lesson 61, reminder) past the status line, over every actual header.
- `key, value = line.split(": ", 1)` — splitting each header line on `": "` — HTTP's specified separator between a header's name and its value — with `1` again limiting to one

split, in case a value itself contains that substring.

### CS Lens

This entire function is a small, hand-written **parser** — turning a
specific, agreed-upon text format into structured data a program can
actually use, the same fundamental activity as Lesson 5's `/proc`
parsing or Lesson 6's `.bash_history` parsing, applied here to a
formal, widely-used protocol instead of an OS-specific file.

### SE Lens

This parser handles the version of HTTP this lesson's own test server
sends and nothing more — it has no support for chunked transfer
encoding, redirects, cookies, compression, or any of dozens of real
HTTP features a genuine library handles. That's not a flaw to feel bad
about — it's precisely why a real HTTP library like `requests` exists,
and precisely what this lesson's comparison, next, is meant to make
visible directly rather than just assert.

### Commands Needed

`python3 http_client.py` — runs it, against a real server.

### Run It — Real Output

Against a real, purpose-built local HTTP server:

```python
status, headers, body = http_get("127.0.0.1", 65470, "/")
print("status:", status)
print("headers:", headers)
print("body:", body.decode())
```

```
$ python3 http_client.py
status: HTTP/1.1 200 OK
headers: {'Content-Type': 'text/html', 'Content-Length': '61', 'Connection': 'close'}
body: <html><body><h1>Hello from the tiny server</h1></body></html>
```

And the identical request, made with `requests` instead, against the
same real server:

```python
import requests
r = requests.get("http://127.0.0.1:65470/")
print("status:", r.status_code)
print("headers:", dict(r.headers))
print("body:", r.text)
```

```
status: 200
headers: {'Content-Type': 'text/html', 'Content-Length': '61', 'Connection': 'close'}
body: <html><body><h1>Hello from the tiny server</h1></body></html>
```

Real, matching results — proof this lesson's hand-built parser
correctly captured the same information a real, mature library did, for
this straightforward case.

### Connection

The hand-built client genuinely works — for a server that closes the
connection as expected. The closing section is where that assumption
breaks, for real.

---

## Closing

### Connect the Pieces

Trace one real request end to end: `http_get()` opened a socket,
connected, and sent a real HTTP request as encoded bytes. The server
(Lesson 19's shape, reused) received it, built a real HTTP response —
status line, headers including `Content-Length`, a blank line, and the
body — and sent it back, then closed its side of the connection (per
`"Connection: close"`). The client's `while True: recv()` loop kept
reading until `recv()` returned empty bytes — exactly the moment the
server's close reached the client — at which point `response` held the
complete reply, ready to be split into headers and body.

### What Breaks Without This

A real server that **doesn't** close the connection after responding —
a genuine, common, and entirely valid HTTP server behavior (keep-alive)
— breaks this client's core assumption completely:

```python
s.settimeout(4)
s.connect(("127.0.0.1", 65471))  # a server that leaves the connection open
s.sendall(b"GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n")

response = b""
while True:
    chunk = s.recv(4096)
    if not chunk:
        break
    response += chunk
```

Real output:

```
genuinely hung, timed out after 4.00s
bytes received before giving up: 116
```

The **entire, complete, valid response** — all 116 bytes of it,
headers and body — arrived from the server almost instantly. The
client never noticed. It kept calling `recv()`, waiting for the
connection to close, which this server was never going to do — the
loop only ever ended because of an artificially added `settimeout(4)`
for this test; without it, this exact call would have hung forever.

The identical request, against the identical server, using `requests`:

```python
r = requests.get("http://127.0.0.1:65471/", timeout=5)
```

Real output:

```
requests finished in 0.004s
status: 200
```

**4 milliseconds**, versus a 4-second forced timeout for the hand-built
version (and an unbounded hang without one). `requests` doesn't wait
for the connection to close at all — it reads the `Content-Length`
header first and stops reading the instant it has received exactly
that many bytes of body, regardless of whether the connection stays
open. That's a real, meaningful piece of protocol-handling logic this
lesson's version never implemented — and exactly the kind of detail a
real library exists to get right, correctly, every time.

### Exercises

1. Fix the bug yourself: parse the `Content-Length` header first, then
   read exactly that many bytes of body instead of reading until the
   connection closes — confirm your fixed version now handles the
   keep-alive server (`tiny_http_server_keepalive.py`-style) instantly,
   the way `requests` did.
2. Add support for a response with **no** `Content-Length` header at
   all (some real responses omit it) — your fixed version from
   Exercise 1 needs a fallback for this case; think about what that
   fallback should be, and why it brings back this lesson's original
   read-until-close approach as one legitimate strategy among several,
   not a mistake in every situation.
3. Try sending a request with a genuinely malformed `Host` header or
   missing the blank-line terminator entirely, and observe how the real
   server (or `requests`, sending it) reacts — direct, hands-on contact
   with what "the protocol expects a specific format" actually means in
   practice.

### Definition of Done

- [ ] `http_client.py` runs and correctly parses a real HTTP response
      from a real server you set up yourself
- [ ] You confirmed your parsed result matches what `requests` reports
      for the identical request
- [ ] You triggered the real hang against a server that doesn't close
      its connection, and confirmed `requests` handles the identical
      case instantly
- [ ] You can explain, without looking back, what specifically
      `requests` does differently that avoids the hang
- [ ] Commit:

```
git add http_client.py
git commit -m "Add a hand-built HTTP client over raw sockets: prove HTTP is just an agreed-upon text format over TCP, and that reading until the connection closes is a real, breakable assumption a mature library like requests doesn't make"
```
