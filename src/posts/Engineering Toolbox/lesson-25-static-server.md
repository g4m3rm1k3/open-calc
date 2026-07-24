# Lesson 25: A URL Is Just a File Path, Trusted a Little Too Much
### (Tiny Web Server / Static File Server)

**What you will build.** A real HTTP server that serves actual files
from a folder on disk — request `/style.css`, get back the real bytes
of `webroot/style.css`, with a correct `Content-Type` header, or a real
404 if the file doesn't exist. The working feature is small — Lesson
24's request parsing, combined with Lesson 9's file-reading. The
transferable problem underneath is a real, serious one: naively turning
a URL path into a file path opens a genuine, classic vulnerability —
**path traversal** — which this lesson doesn't just describe, it
actually exploits, against a real server, to read a real file the
server was never supposed to expose.

**Pipeline so far:** unchanged — `Program → Socket → Network → Socket
→ Program` — this lesson combines Lesson 24's request-parsing with
Lesson 9's file-reading, at the same stage.

**What you need to know first.** From Lesson 24: parsing an HTTP
request line, building an HTTP response by hand. From Lesson 9:
reading a file's raw bytes. New in this lesson: the `mimetypes`
module, and `os.path.abspath()`.

**An honesty note.** The vulnerability in this lesson's first version
is real and was genuinely exploited against a real, running server —
not simulated. `requests`, used as the client for the safe parts of
this lesson, turned out to *normalize* `..` out of URLs before sending
them, which meant it couldn't be used to demonstrate the attack — the
exploit needed a raw socket instead, sending the malicious request
exactly as an attacker would craft it by hand, bypassing any client-
side protection entirely.

---

## Concept Unit: Parsing Method and Path

### The Problem

Lesson 24 parsed a response; this lesson needs to parse a **request** —
specifically, pulling the requested path (`/index.html`, `/style.css`,
...) out of the request line, so the server knows *which* file to
serve.

### Introduce the Concept in Isolation

```python
request = "GET /index.html HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n"
first_line = request.split("\r\n")[0]
method, path, version = first_line.split(" ")
print("method:", method)
print("path:", path)
print("version:", version)
```

Run it:

```
method: GET
path: /index.html
version: HTTP/1.1
```

This proves the request line — the very first line of any HTTP request
— is three space-separated fields: the method, the path, and the
protocol version, in that fixed order. Splitting it is exactly the same
kind of parsing Lesson 24 already did on the response side, just
applied to the first line of the *other* direction of the exchange.
This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `static_server.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket`, `os`, `mimetypes` modules; a real
  `webroot/` folder containing at least one file to serve

### The New Code

```python
import socket
import os
import mimetypes

HOST = "127.0.0.1"
PORT = 65480
WEBROOT = "/home/claude/webroot"

def run_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("static file server listening...")
        while True:
            conn, addr = server_socket.accept()
            with conn:
                request = conn.recv(4096).decode()
                if not request:
                    continue
                first_line = request.split("\r\n")[0]
                method, path, version = first_line.split(" ")
                print(f"{method} {path}")
```

### The Updated Project

```python
import socket
import os
import mimetypes

HOST = "127.0.0.1"
PORT = 65480
WEBROOT = "/home/claude/webroot"

def run_server():                                                    # ← new
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:  # ← new
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)      # ← new
        server_socket.bind((HOST, PORT))                                            # ← new
        server_socket.listen()                                                        # ← new
        print("static file server listening...")                                        # ← new
        while True:                                                                        # ← new
            conn, addr = server_socket.accept()                                               # ← new
            with conn:                                                                           # ← new
                request = conn.recv(4096).decode()                                                   # ← new
                if not request:                                                                          # ← new
                    continue                                                                                # ← new
                first_line = request.split("\r\n")[0]                                                          # ← new
                method, path, version = first_line.split(" ")                                                     # ← new
                print(f"{method} {path}")                                                                            # ← new
```

The server now accepts connections (Lesson 19's shape, reused) and, for
every request, correctly extracts the requested path — but does
nothing with it yet.

### Mechanical Walkthrough
- `import os`, `import mimetypes` — reminders/first appearance.
- `WEBROOT = "/home/claude/webroot"` — a plain string constant naming

the one folder this server is meant to serve files from. `with
socket.socket(...) as server_socket:`, `.setsockopt(...)`, `.bind(...)`,
- `.listen()`, `while True: conn, addr = server_socket.accept()` — all
direct reminders of Lessons 19/23. `request = conn.recv(4096).decode()`
— Lesson 24, reminder — reading and decoding the incoming request in
one line, reasonable here since a real request line plus headers
almost always fits comfortably under 4096 bytes. `if not request:
- continue` — Lesson 19's empty-bytes-means-disconnected pattern,
reminder, applied to a request instead of a chat message. `first_line
= request.split("\r\n")[0]`, `method, path, version =
- first_line.split(" ")` — the concept from this unit's lab, reused for
real.

### CS Lens

Not new beyond parsing itself, already covered by Lesson 24 and this
unit's own lab — skipped per the Stopping Rule.

### SE Lens

`path`, at this point, is **completely attacker-controlled text** — the
server has accepted it from the network with zero validation so far.
Every line of code that follows, until this lesson's closing section,
treats it as if it were trustworthy. That gap — between "data a client
sent" and "data safe to use directly" — is the entire reason this
lesson's vulnerability exists at all, and it's worth noticing the exact
moment it opens, right here, before a single file gets touched.

### Commands Needed

None yet.

### Run It

Not runnable for meaningful output — the path is parsed but never used
to serve anything.

### Connection

We can now see exactly what path was requested. The next unit turns
that path into an actual file read.

---

## Concept Unit: `mimetypes` and Serving the File

### The Problem

Different files need different `Content-Type` headers — a browser
needs to know `style.css` is CSS and `index.html` is HTML to handle
each correctly. Hardcoding this per extension, the way Lesson 15's
`CATEGORIES` dictionary did for a completely different purpose, would
work but would need constant updating for every file type that might
ever be served.

### Introduce the Concept in Isolation

```python
import mimetypes
print(mimetypes.guess_type("index.html"))
print(mimetypes.guess_type("style.css"))
print(mimetypes.guess_type("data.bin"))
```

Run it:

```
('text/html', None)
('text/css', None)
('application/octet-stream', None)
```

This proves `mimetypes.guess_type()` — a real standard-library tool,
not something this curriculum built — already knows the correct
`Content-Type` for a huge range of common file extensions, returning
`None` (the second value, encoding info not relevant here) alongside
it, and falling back to `application/octet-stream` (a generic "unknown
binary data" type) for anything it doesn't recognize. This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `static_server.py`
- **Change type:** add — completes the request-handling logic
- **Location:** inside the `with conn:` block, after parsing `path`
- **Dependencies:** `path`, `WEBROOT`, `mimetypes`, `os`

### The New Code

```python
if path == "/":
    path = "/index.html"

file_path = WEBROOT + path

if os.path.isfile(file_path):
    with open(file_path, "rb") as f:
        body = f.read()
    content_type, _ = mimetypes.guess_type(file_path)
    if content_type is None:
        content_type = "application/octet-stream"
    response = (
        b"HTTP/1.1 200 OK\r\n"
        b"Content-Type: " + content_type.encode() + b"\r\n"
        b"Content-Length: " + str(len(body)).encode() + b"\r\n"
        b"Connection: close\r\n\r\n" + body
    )
else:
    body = b"<html><body><h1>404 Not Found</h1></body></html>"
    response = (
        b"HTTP/1.1 404 Not Found\r\n"
        b"Content-Type: text/html\r\n"
        b"Content-Length: " + str(len(body)).encode() + b"\r\n"
        b"Connection: close\r\n\r\n" + body
    )
conn.sendall(response)
```

### The Updated Project

```python
import socket
import os
import mimetypes

HOST = "127.0.0.1"
PORT = 65480
WEBROOT = "/home/claude/webroot"

def run_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("static file server listening...")
        while True:
            conn, addr = server_socket.accept()
            with conn:
                request = conn.recv(4096).decode()
                if not request:
                    continue
                first_line = request.split("\r\n")[0]
                method, path, version = first_line.split(" ")
                print(f"{method} {path}")

                if path == "/":                                                # ← new
                    path = "/index.html"                                          # ← new

                file_path = WEBROOT + path                                          # ← new

                if os.path.isfile(file_path):                                          # ← new
                    with open(file_path, "rb") as f:                                      # ← new
                        body = f.read()                                                      # ← new
                    content_type, _ = mimetypes.guess_type(file_path)                          # ← new
                    if content_type is None:                                                      # ← new
                        content_type = "application/octet-stream"                                     # ← new
                    response = (                                                                         # ← new
                        b"HTTP/1.1 200 OK\r\n"                                                               # ← new
                        b"Content-Type: " + content_type.encode() + b"\r\n"                                     # ← new
                        b"Content-Length: " + str(len(body)).encode() + b"\r\n"                                    # ← new
                        b"Connection: close\r\n\r\n" + body                                                          # ← new
                    )                                                                                                   # ← new
                else:                                                                                                     # ← new
                    body = b"<html><body><h1>404 Not Found</h1></body></html>"                                              # ← new
                    response = (                                                                                              # ← new
                        b"HTTP/1.1 404 Not Found\r\n"                                                                            # ← new
                        b"Content-Type: text/html\r\n"                                                                              # ← new
                        b"Content-Length: " + str(len(body)).encode() + b"\r\n"                                                        # ← new
                        b"Connection: close\r\n\r\n" + body                                                                              # ← new
                    )                                                                                                                       # ← new
                conn.sendall(response)                                                                                                        # ← new

run_server()
```

`static_server.py` is now complete: it serves real files with correct
content types, and returns a real 404 for anything that doesn't exist —
and, as this lesson's closing section proves, has a real, serious
security flaw baked into `file_path = WEBROOT + path` that nothing here
catches.

### Mechanical Walkthrough
- `if path == "/": path = "/index.html"` — a real, common web-server
convention: a request for the site root serves a default file. `file_path
- = WEBROOT + path` — plain string concatenation, deliberately **not**
`os.path.join()`, joining the trusted `WEBROOT` constant with the
completely untrusted `path` from the previous unit. `os.path.isfile(
- file_path)` — Lesson 7, reminder.
- `open(file_path, "rb")`, `f.read()` — Lesson 9/61, reminder — reading the file's real bytes.
- `mimetypes.guess_type(file_path)` — the concept from this unit's lab,

reused for real. The response-building itself — Lesson 24's byte-string
assembly, reminder, reused for both the success and 404 cases.

### CS Lens

Not new beyond file reading and response formatting, both already
covered — skipped per the Stopping Rule; this unit's real content is in
the SE Lens below.

### SE Lens

`file_path = WEBROOT + path` looks completely reasonable — it's exactly
how you'd combine a base folder with a relative path, the same pattern
Lesson 2's `os.path.join()` used constantly throughout this curriculum.
The problem is what it doesn't do: it never checks that the *result*
actually stays inside `WEBROOT`. A path like `/../secret_folder/
file.txt`, concatenated onto `WEBROOT`, produces a real filesystem path
that walks *back out* of the intended folder entirely — and nothing in
this function notices. This is exactly the gap the closing section
exploits.

### Commands Needed

`python3 static_server.py` — runs it.

### Run It — Real Output

Legitimate requests, made with `requests`, against a real webroot
folder:

```
GET / -> 200 text/html
<html><body><h1>Welcome to the tiny web server</h1></body></html>

GET /style.css -> 200 text/css
body { font-family: sans-serif; }

GET /nonexistent.html -> 404
```

Real, correct behavior for every ordinary case — the server genuinely
works. The closing section is where it turns out not to be safe.

### Connection

The server correctly serves real files and returns real 404s. The
closing section is a real exploit against this exact, working server.

---

## Closing

### Connect the Pieces

Trace `GET /style.css` end to end: `first_line.split(" ")` extracted
`path = "/style.css"`. `file_path = WEBROOT + path` produced
`/home/claude/webroot/style.css` — a genuinely valid path, safely
inside the intended folder. `os.path.isfile()` confirmed it existed,
`open()`/`.read()` retrieved its real bytes, `mimetypes.guess_type()`
correctly identified `text/css`, and the response carried all of it
back correctly. Nothing about this one request was unsafe — the
danger was always in what a *different*, deliberately crafted `path`
could do to that same, unguarded concatenation.

### What Breaks Without This

A real path traversal attack, sent as a raw HTTP request over a socket
(deliberately bypassing `requests`, which — checked directly — actually
normalizes `..` out of URLs before sending them, so it couldn't be used
to demonstrate this):

```python
request = "GET /../secret_outside_webroot/passwords.txt HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n"
s.sendall(request.encode())
```

Real server response:

```
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 35

top secret, should never be served
```

A genuine, real success — the server happily served a file from
**outside** `WEBROOT` entirely, a file it was never supposed to expose,
because `WEBROOT + "/../secret_outside_webroot/passwords.txt"`
produces a real, valid filesystem path that walks back up out of
`webroot/` and into a completely different folder — and
`os.path.isfile()` doesn't care *how* a path got where it points, only
whether something real is there.

### The Fix, Verified

```python
WEBROOT = os.path.abspath("/home/claude/webroot")
# ...
file_path = os.path.abspath(WEBROOT + path)

if not file_path.startswith(WEBROOT + os.sep) and file_path != WEBROOT:
    # 403 Forbidden -- reject it
```

`os.path.abspath()` — first appearance: resolves a path, including any
`..` segments, into its true, final, absolute form — the same
resolution Lesson 8's `os.path.realpath()` did for symlinks, here
applied to `..` traversal instead. Checking that the *resolved* path
still starts with `WEBROOT` is what actually catches the attack: an
attempted escape resolves to a path outside `WEBROOT`, and the check
fails, correctly.

Real output, identical attack, against the fixed server:

```
HTTP/1.1 403 Forbidden
Content-Type: text/html
Content-Length: 48

<html><body><h1>403 Forbidden</h1></body></html>
```

And confirmed, directly, that legitimate requests still work completely
normally on the fixed server — `GET /` and `GET /style.css` both still
returned real `200` responses with correct content, exactly as before.

### Exercises

1. Try the attack with different traversal patterns (`/./../`,
   URL-encoded `%2e%2e`, multiple `../../../` chains) against both the
   original and fixed servers — confirm the fix holds regardless of how
   many `..` segments or what form they take, since `os.path.abspath()`
   resolves all of them the same way.
2. Add support for serving files from **subfolders** inside `webroot/`
   (`/images/logo.png`) and confirm the traversal protection still
   correctly allows legitimate nested paths while still blocking
   escapes.
3. Research (read, don't just guess) what real production web servers
   like nginx or Apache do differently and additionally to prevent this
   exact class of vulnerability — this lesson's fix is real and
   sufficient for the case demonstrated, but production servers handle
   several related edge cases (symlinks pointing outside the root,
   for one — directly related to Lesson 8) this lesson doesn't cover.

### Definition of Done

- [ ] `static_server.py` runs and correctly serves real files with
      correct content types from a webroot folder you built yourself
- [ ] You performed the real path traversal attack yourself, using a
      raw socket, and confirmed it actually retrieved a file from
      outside the webroot
- [ ] You applied the `os.path.abspath()` fix and confirmed the
      identical attack now returns 403 instead of succeeding
- [ ] You confirmed the fix doesn't break any legitimate request
- [ ] You can explain, without looking back, exactly why
      `WEBROOT + path` alone isn't safe, even though it looks correct
- [ ] Commit:

```
git add static_server.py
git commit -m "Add a static file server: prove that concatenating a trusted base path with untrusted user input is a real path traversal vulnerability, not a theoretical one, and that resolving + verifying the final path is the actual fix"
```
