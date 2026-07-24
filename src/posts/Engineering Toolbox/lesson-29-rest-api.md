# Lesson 29: A Route Is Just a Lookup Key
### (Simple REST API — URL Shortener Backend)

**What you will build.** A real REST API — a working URL shortener.
`POST /links` with a JSON body creates a short code for a URL;
`GET /links/<code>` looks it up. The working feature combines pieces
already built: Lesson 25's request parsing, Lesson 24's response
building, extended with real JSON encoding and a genuine **router** —
a dictionary mapping `(method, path)` pairs to the logic that handles
them. The transferable problem underneath is one this lesson proves
directly, not just claims: reading an HTTP request's *body* correctly
has exactly the same real danger Lesson 26 already proved for a custom
file-transfer protocol — a single `recv()` call cannot be trusted to
return the whole thing, and this lesson triggers that failure for real,
on a REST API instead of a file transfer.

**Pipeline so far:** unchanged — `Program → Socket → Network → Socket
→ Program` — this lesson combines Lesson 25's request parsing with
real JSON handling and multi-route dispatch.

**What you need to know first.** From Lesson 25: parsing an HTTP
request line, building an HTTP response by hand. From Lesson 26:
`recv()` not guaranteeing a complete read in one call, and the fix
(read according to a known length, not a single call). New in this
lesson: the `json` module, and dictionary-based routing.

---

## Concept Unit: `json.dumps()` / `json.loads()`

### The Problem

A REST API's whole point is exchanging structured data, not just
plain text or HTML. We need a real, standard way to turn a Python
dictionary into text that can travel over the wire, and back again.

### Introduce the Concept in Isolation

```python
import json
data = {"url": "https://example.com"}
encoded = json.dumps(data)
print(encoded, type(encoded))
decoded = json.loads(encoded)
print(decoded, type(decoded))
```

Run it:

```
{"url": "https://example.com"} <class 'str'>
{'url': 'https://example.com'} <class 'dict'>
```

This proves `json.dumps()` converts a Python dictionary into a real
JSON-formatted string — genuinely a standard, language-independent
text format, not something Python invented — and `json.loads()`
reverses it exactly, recovering an equivalent Python dictionary. This
throwaway example is discarded; the real project encodes and decodes
real request/response data.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `rest_api.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket`, `json`, `string`, `random` modules

### The New Code

```python
import socket
import json
import string
import random

HOST = "127.0.0.1"
PORT = 65495

links = {}

def generate_code(length=6):
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(length))
```

### The Updated Project

This is the entire file so far:

```python
import socket
import json
import string
import random

HOST = "127.0.0.1"
PORT = 65495

links = {}                                                # ← new

def generate_code(length=6):                                # ← new
    chars = string.ascii_letters + string.digits               # ← new
    return "".join(random.choice(chars) for _ in range(length))  # ← new
```

`links` is a plain dictionary standing in for real storage — mapping
each generated short code to the real URL it represents. `generate_code
()` produces a random 6-character code from letters and digits.

### Mechanical Walkthrough
- `import json` — first appearance.
- `import string`, `import random` —
first appearances: `string.ascii_letters` is a ready-made constant
string containing every letter, upper and lower case; `string.digits`
- is `"0123456789"`.
- `links = {}` — an empty dict, meant to persist for
the server's whole run (not saved to disk — a real, honest
simplification; a production version would use a real database).
- `"".join(random.choice(chars) for _ in range(length))` — a generator
expression (Lesson 28, reminder) feeding `.join()`, picking `length`
random characters from `chars` and joining them into one string;
- `random.choice()` — first appearance, picks one random element from a
sequence.

### CS Lens

Not new beyond `json` itself, this unit's own content — skipped a
second lens per the Stopping Rule.

### SE Lens

Generating a random code, rather than an incrementing counter (`1`,
`2`, `3`, ...), is a real, deliberate choice for a URL shortener
specifically: sequential codes let anyone guess and enumerate every
link ever created, just by trying nearby numbers — a real information
leak. Random codes make that meaningfully harder, though not
impossible (a genuinely secure system would also check for and handle
collisions, and use a cryptographically strong random source — both
real gaps this lesson's simple version leaves open, flagged rather than
silently ignored).

### Commands Needed

None yet.

### Run It

Not runnable for meaningful output — nothing calls `generate_code()`
yet, and no server exists.

### Connection

We can encode/decode JSON and generate codes. The next unit builds the
actual route handlers and the router that dispatches to them.

---

## Concept Unit: Route Handlers and a Router Dictionary

### The Problem

A real API has more than one thing it can do — create a link, look one
up — and the server needs to figure out, for each incoming request,
*which* logic should handle it, based on the method and path.

### Introduce the Concept in Isolation

```python
routes = {}
routes[("GET", "/hello")] = lambda: "hi"

method, path = "GET", "/hello"
handler = routes.get((method, path))
if handler:
    print(handler())
else:
    print("no route found")
```

Run it:

```
hi
```

This proves a dictionary can use a **tuple** as its key — `(method,
path)` — letting one lookup answer "is there a handler for exactly
this method-and-path combination," and `.get()` (Lesson 2/13, reminder)
safely returns `None` for anything not registered, instead of raising
an error. This throwaway example is discarded; the real project
doesn't build a generic router table — it dispatches with a direct
`if`/`elif` chain instead, which is simpler for the two routes this
lesson needs, with the tradeoff named directly below.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `rest_api.py`
- **Change type:** add — the two route handler functions and the
  response-building helper
- **Location:** after `generate_code()`
- **Dependencies:** `links`, `generate_code`, `json`

### The New Code

```python
def handle_create(body):
    data = json.loads(body)
    url = data["url"]
    code = generate_code()
    links[code] = url
    return 201, {"code": code, "url": url}


def handle_lookup(code):
    if code in links:
        return 200, {"code": code, "url": links[code]}
    return 404, {"error": "not found"}


def json_response(status, body_dict):
    status_text = {200: "OK", 201: "Created", 404: "Not Found"}[status]
    body = json.dumps(body_dict).encode()
    response = (
        f"HTTP/1.1 {status} {status_text}\r\n"
        f"Content-Type: application/json\r\n"
        f"Content-Length: {len(body)}\r\n"
        f"Connection: close\r\n\r\n"
    ).encode() + body
    return response
```

### The Updated Project

```python
import socket
import json
import string
import random

HOST = "127.0.0.1"
PORT = 65495

links = {}

def generate_code(length=6):
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(length))


def handle_create(body):                                    # ← new
    data = json.loads(body)                                     # ← new
    url = data["url"]                                              # ← new
    code = generate_code()                                           # ← new
    links[code] = url                                                  # ← new
    return 201, {"code": code, "url": url}                               # ← new


def handle_lookup(code):                                                   # ← new
    if code in links:                                                         # ← new
        return 200, {"code": code, "url": links[code]}                          # ← new
    return 404, {"error": "not found"}                                            # ← new


def json_response(status, body_dict):                                               # ← new
    status_text = {200: "OK", 201: "Created", 404: "Not Found"}[status]                # ← new
    body = json.dumps(body_dict).encode()                                                # ← new
    response = (                                                                            # ← new
        f"HTTP/1.1 {status} {status_text}\r\n"                                                 # ← new
        f"Content-Type: application/json\r\n"                                                     # ← new
        f"Content-Length: {len(body)}\r\n"                                                           # ← new
        f"Connection: close\r\n\r\n"                                                                    # ← new
    ).encode() + body                                                                                      # ← new
    return response                                                                                           # ← new
```

Both real route handlers, plus a shared helper for building a correct
JSON HTTP response, are complete — but nothing yet reads a real
request or calls any of them.

### Mechanical Walkthrough
- `data = json.loads(body)` — the concept from this unit's lab, reused for real, decoding the request's raw body.
- `url = data["url"]` — plain

dict key access, already basic. `code = generate_code()`, `links[code]
- = url` — using this lesson's earlier unit directly.
- `return 201, {...}`
— a function returning a **tuple** (a status code and a result
dictionary together), already-basic tuple usage (Lesson 1, reminder),
here used to hand back two related pieces of information from one
- call.
- `if code in links:` — dictionary membership testing, already basic.
- `json_response(status, body_dict)` — `status_text = {200: "OK", ...}[status]` — a dictionary used as a lookup table (not a router this

time, just a status-code-to-text mapping), reused idea, new specific
use. The f-string response assembly — Lesson 25, reminder, reused for
real JSON content instead of HTML/files.

### CS Lens

`(status, result_dict)` returned as a tuple from each handler, then
interpreted uniformly by whatever calls them, is a small but real
instance of a **consistent interface** — every handler, regardless of
what it actually does internally, hands back the same *shape* of
result, which is exactly what lets one small piece of dispatch code
(the next section) treat every route identically.

### SE Lens

Using a direct `if method == ... and path == ...:` chain, rather than
this unit's lab's dictionary-based router, is a real, deliberate choice
for exactly two routes — simple, readable, no extra machinery. A real
API with dozens of routes would genuinely benefit from a proper router
(the dictionary-of-tuples idea from the lab, or path patterns with
placeholders like `/links/<code>`) — that tradeoff point, simple chain
versus real router, is worth recognizing directly: the "right" choice
depends on how much the API actually needs to route, not on which
approach is inherently better.

### Commands Needed

None yet.

### Run It

Not runnable for a complete request yet — the handlers exist, but no
server reads real requests and calls them.

### Connection

We have real, working route logic. The last piece wires up the actual
server loop — including reading the request body *correctly*, which
Lesson 26 already proved can't be trusted to a single `recv()` call.

---

## Assembling the Server (Reusing Lesson 26's Real Lesson)

```python
def run_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("REST API listening...")
        while True:
            conn, addr = server_socket.accept()
            with conn:
                request = conn.recv(4096)
                header_part, _, rest = request.partition(b"\r\n\r\n")
                header_lines = header_part.decode().split("\r\n")
                method, path, version = header_lines[0].split(" ")

                headers = {}
                for line in header_lines[1:]:
                    key, value = line.split(": ", 1)
                    headers[key] = value

                content_length = int(headers.get("Content-Length", 0))
                body = rest
                while len(body) < content_length:
                    body += conn.recv(4096)

                if method == "POST" and path == "/links":
                    status, result = handle_create(body)
                elif method == "GET" and path.startswith("/links/"):
                    code = path[len("/links/"):]
                    status, result = handle_lookup(code)
                else:
                    status, result = 404, {"error": "no such route"}

                conn.sendall(json_response(status, result))

run_server()
```

`while len(body) < content_length: body += conn.recv(4096)` is the one
genuinely load-bearing new piece: it does **not** trust the initial
`conn.recv(4096)` to contain the entire body — it keeps reading,
exactly as Lesson 26's `recv_exact()` did, until it has genuinely
collected `content_length` bytes, using the request's own
`Content-Length` header (Lesson 24/25, reminder) as the known target.
Everything else — request-line parsing, header parsing — is direct
reuse of Lesson 25.

### Commands Needed

`python3 rest_api.py` — runs it.

### Run It — Real Output

Creating a real link:

```python
import requests
r = requests.post("http://127.0.0.1:65495/links", json={"url": "https://example.com/some/long/path"})
print(r.status_code, r.json())
```

```
201 {'code': 'oW2nPU', 'url': 'https://example.com/some/long/path'}
```

Looking it up, and a genuine 404 for a code that doesn't exist:

```python
r2 = requests.get("http://127.0.0.1:65495/links/oW2nPU")
print(r2.status_code, r2.json())
r3 = requests.get("http://127.0.0.1:65495/links/doesnotexist")
print(r3.status_code, r3.json())
```

```
200 {'code': 'oW2nPU', 'url': 'https://example.com/some/long/path'}
404 {'error': 'not found'}
```

And confirmed reliable across multiple real, independent links, each
correctly stored and independently retrievable:

```
https://a.com -> JLqwdg -> lookup: {'code': 'JLqwdg', 'url': 'https://a.com'}
https://b.com -> LhOwnN -> lookup: {'code': 'LhOwnN', 'url': 'https://b.com'}
https://c.com -> Ug5Puu -> lookup: {'code': 'Ug5Puu', 'url': 'https://c.com'}
```

---

## Closing

### Connect the Pieces

Trace a full `POST /links` request end to end: the request line was
parsed into `method="POST"`, `path="/links"`. `Content-Length` was read
from the headers, and the body-reading loop kept calling `recv()` until
it had genuinely collected that many bytes — not just whatever the
first call happened to return. `json.loads(body)` decoded the real JSON
into a dictionary; `handle_create()` generated a code, stored it in
`links`, and returned `(201, {...})`. `json_response()` built a real,
correctly-framed HTTP response with its own accurate `Content-Length`,
and `conn.sendall()` sent it back — the client's `requests.post()`
received and correctly parsed it as real JSON.

### What Breaks Without This

Skip the body-completion loop — trust a single `recv(4096)` to contain
the whole request, headers and body together, exactly the mistake
Lesson 26 already proved doesn't hold:

```python
request = conn.recv(4096)
header_part, _, body = request.partition(b"\r\n\r\n")
# ... parse method/path ...
data = json.loads(body)  # trusting body is complete
```

Sending a real POST with a genuinely large JSON body (a URL padded to
roughly 200,000 bytes) to this naive version:

```python
long_url = "https://example.com/" + ("x" * 200000)
requests.post("http://127.0.0.1:65496/links", json={"url": long_url})
```

Real server-side output:

```
JSON PARSE FAILED: Unterminated string starting at...
body received so far was 3888 bytes: b'{"url": "https://example.com/xxxxx...
```

Real, direct confirmation: the first `recv(4096)` call returned only
3,888 bytes of a body that was actually hundreds of thousands of bytes
long — nowhere close to complete — and `json.loads()` correctly failed
on the truncated, syntactically-broken JSON it was handed. This is
Lesson 26's exact lesson, resurfacing in a completely different
context: any protocol built on top of TCP — a custom file transfer, or
a REST API's request body — inherits the same real risk, and "the
request is small in my testing" is not the same thing as "reading it
in one `recv()` call is correct."

### Exercises

1. Confirm the real server (with the `Content-Length`-based reading
   loop) correctly handles the identical 200,000-byte body that broke
   the naive version.
2. Add a `DELETE /links/<code>` route, reusing `path.startswith()` the
   same way `handle_lookup` does, removing an entry from `links`.
3. Add real input validation to `handle_create()` — reject a request
   whose JSON body is missing the `"url"` key entirely, returning a
   real `400 Bad Request` instead of letting a `KeyError` crash the
   server (Lesson 4's `try`/`except` pattern applies directly here).

### Definition of Done

- [ ] `rest_api.py` runs, and you created and looked up at least two
      real links, confirmed with real `requests` calls
- [ ] You confirmed a lookup for a nonexistent code returns a real 404
      with a JSON error body
- [ ] You triggered the real body-truncation failure with a
      deliberately large request against the naive version, and
      confirmed the real server handles the identical case correctly
- [ ] You can explain, without looking back, why `Content-Length` is
      what makes correctly reading the body possible at all
- [ ] Commit:

```
git add rest_api.py
git commit -m "Add a JSON REST API (URL shortener): prove routing is just dispatching on (method, path), and that reading a request body correctly requires trusting Content-Length, not a single recv() call, exactly as Lesson 26 already proved for file transfer"
```
