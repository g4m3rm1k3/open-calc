# SE Masterclass — LAB-44 — HTTP Protocol

**Language: Python** — the runtime for most of Phase 4 (Node.js returns for Module 2's event-loop lab).
*Why raw Python sockets, no framework:* Every web framework you will ever use (FastAPI, Express, Django) is, underneath, a program that reads TEXT off a socket in a specific format and writes TEXT back in a specific format. Building that "underneath" by hand, once, makes every HTTP concept (headers, status codes, keep-alive) concrete instead of magic.

**Prerequisites:** All of Phase 3. LAB-10's tokenizing instincts apply directly — an HTTP request is just text with a defined grammar, waiting to be parsed.

**What this lab adds:**
- HTTP is TEXT — a request and a response are both just formatted strings sent over a TCP connection
- The request line, headers, and body — and how to parse them by hand
- Status codes and what they actually mean
- Building a working (if minimal) HTTP server using nothing but Python's `socket` module

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If HTTP is "just text," what tool, with zero HTTP-specific code, could you use to manually type a request and see a raw response?
> 2. A request line looks like `GET /users HTTP/1.1`. What are the three pieces, and what does each one mean?
> 3. Why does an HTTP response need a `Content-Length` header — what problem would exist without it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python server.py` and visiting `http://localhost:8080/` in a browser (or running `curl -v http://localhost:8080/`) shows:

```
=== Raw Request, As Received ===
GET / HTTP/1.1
Host: localhost:8080
User-Agent: curl/8.0.1
Accept: */*

=== Parsed Request ===
method: GET
path: /
version: HTTP/1.1
headers: { 'Host': 'localhost:8080', 'User-Agent': 'curl/8.0.1', 'Accept': '*/*' }

=== Raw Response Sent ===
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 13

Hello, World!

=== Routing: 404 for Unknown Paths ===
GET /nonexistent -> 404 Not Found

=== Serving a Static File ===
GET /page.html -> 200 OK, Content-Type: text/html, Content-Length: 87
```

---

### Concept: HTTP Is Just Text Over a Socket

**What it is:** HTTP (HyperText Transfer Protocol) is a TEXT-based protocol: a client opens a TCP connection, writes a specifically-formatted TEXT STRING (the "request"), and the server writes back a specifically-formatted text string (the "response"). There is no magic — a "web framework" is a program that automates reading and writing this exact text format.

**The problem before:** Without seeing the raw text, HTTP concepts (headers, status codes, methods) feel like framework-specific syntax to memorize rather than a genuinely simple, inspectable text format.

**The solution:** Open a raw TCP socket, read the bytes that arrive, and look at them directly — no HTTP library involved at all.

**Canonical example — see it with your own eyes, before writing any code:**

```bash
telnet example.com 80
GET / HTTP/1.1
Host: example.com

```
(Type this exactly, including a BLANK line at the end, then press Enter.) You will see a raw HTTP response printed directly to your terminal — headers, blank line, HTML body — with ZERO HTTP-specific tooling beyond `telnet`, which only knows how to open a raw text connection.

---

## Step 1 — Read a Raw Request

```python
# server.py
import socket

HOST = 'localhost'
PORT = 8080

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind((HOST, PORT))
server_socket.listen(1)
print(f"Listening on http://{HOST}:{PORT}")

while True:
    client_socket, address = server_socket.accept()        # blocks until a client connects
    request_bytes = client_socket.recv(4096)                 # read up to 4096 bytes — the raw request
    request_text = request_bytes.decode('utf-8')

    print("=== Raw Request, As Received ===")
    print(request_text)

    client_socket.close()                                     # (no response sent yet — Step 3 adds that)
```

### SAVE AND TRY

```bash
python server.py
```

In a SEPARATE terminal:
```bash
curl http://localhost:8080/
```

**Expected server-side output:**
```
=== Raw Request, As Received ===
GET / HTTP/1.1
Host: localhost:8080
User-Agent: curl/8.0.1
Accept: */*

```

**Confirm this is genuinely raw, unprocessed TEXT:** `request_bytes.decode('utf-8')` is the ENTIRE transformation applied — bytes to a string, nothing HTTP-specific. Everything you see is exactly what `curl` sent, character for character, over the TCP connection — including the BLANK LINE at the end, which (as you'll see in Step 2) is not decorative; it's the signal that headers have ended.

**Change something:** Run `curl -H "X-My-Header: hello" http://localhost:8080/`. Confirm your custom header appears in the raw request text, in the exact form `X-My-Header: hello`.

---

## Step 2 — Parse the Request Line and Headers

```python
def parse_request(request_text: str) -> dict:
    lines = request_text.split('\r\n')                        # ← add: HTTP uses \r\n (not just \n) as its line separator
    method, path, version = lines[0].split(' ')                 # ← add: the REQUEST LINE — 3 space-separated pieces

    headers = {}
    for line in lines[1:]:
        if line == '':                                           # ← add: a BLANK line signals "headers are done"
            break
        key, value = line.split(': ', 1)                          # ← add: 'Key: value' — split on the FIRST ': ' only
        headers[key] = value

    return {'method': method, 'path': path, 'version': version, 'headers': headers}
```

Add to `server.py`'s loop:

```python
    parsed = parse_request(request_text)
    print("=== Parsed Request ===")
    print(f"method: {parsed['method']}")
    print(f"path: {parsed['path']}")
    print(f"version: {parsed['version']}")
    print(f"headers: {parsed['headers']}")
```

### SAVE AND TRY

Restart `server.py`, run `curl http://localhost:8080/` again.

**Expected:**
```
=== Parsed Request ===
method: GET
path: /
version: HTTP/1.1
headers: {'Host': 'localhost:8080', 'User-Agent': 'curl/8.0.1', 'Accept': '*/*'}
```

**Confirm the `\r\n` detail matters:** HTTP's line separator is CARRIAGE RETURN + LINE FEED (`\r\n`), not just `\n` — a subtlety inherited from HTTP's early-internet, cross-platform-text-protocol history. Splitting on `\r\n` specifically (not Python's default `\n`-only line splitting) is what correctly separates the request line from each header line. This is exactly LAB-10's lexer instinct: know your EXACT delimiter, don't assume.

**Change something:** Send a `POST` request instead: `curl -X POST http://localhost:8080/submit`. Confirm `method: POST` and `path: /submit` print correctly — the SAME parsing code handles any method/path combination, because it's just splitting text by a fixed, known format.

---

### Concept: Status Codes and the Response Format

**What it is:** An HTTP RESPONSE has the same shape as a request, mirrored: a STATUS LINE (`HTTP/1.1 200 OK`) instead of a request line, headers, a blank line, then a body. The status CODE (a number like `200`, `404`, `500`) tells the client, in one number, roughly what happened — `2xx` = success, `4xx` = the CLIENT did something wrong (bad request, not found), `5xx` = the SERVER did something wrong.

---

## Step 3 — Send a Raw Response by Hand

```python
def build_response(status_code: int, status_text: str, body: str, content_type: str = 'text/plain') -> bytes:
    response = (
        f"HTTP/1.1 {status_code} {status_text}\r\n"          # ← add: the status line
        f"Content-Type: {content_type}\r\n"
        f"Content-Length: {len(body.encode('utf-8'))}\r\n"     # ← add: byte length, not character length — matters for non-ASCII text
        f"\r\n"                                                 # ← add: the BLANK LINE — signals "headers are done, body follows"
        f"{body}"
    )
    return response.encode('utf-8')
```

Add to `server.py`'s loop, after printing the parsed request:

```python
    response_bytes = build_response(200, 'OK', 'Hello, World!\n')
    client_socket.sendall(response_bytes)

    print("=== Raw Response Sent ===")
    print(response_bytes.decode('utf-8'))

    client_socket.close()
```

### SAVE AND TRY

Restart `server.py`. Visit `http://localhost:8080/` in an actual BROWSER this time.

**Expected in the browser:** The page displays `Hello, World!` as plain text.

**Expected server-side output:**
```
=== Raw Response Sent ===
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 13

Hello, World!
```

**Confirm the blank line's role, precisely:** Everything BEFORE the blank line is HEADERS (metadata about the response). Everything AFTER it is the BODY (the actual content). A client parsing this response uses the EXACT same "blank line ends headers" rule your `parse_request` function used in Step 2 — request and response formats are symmetric.

**Why `Content-Length` matters:** Without it, the CLIENT would have no way to know where the body ENDS — should it keep reading forever, waiting for more bytes? `Content-Length: 13` tells it EXACTLY: "read 13 more bytes after the blank line, then you have the complete body, stop waiting."

---

## Step 4 — Routing: Different Paths, 404 for Unknown Ones

```python
def handle_request(parsed: dict) -> bytes:
    if parsed['path'] == '/':
        return build_response(200, 'OK', 'Hello, World!\n')
    else:
        return build_response(404, 'Not Found', f"404: {parsed['path']} not found\n")   # LAB-09's boundary instinct, at the HTTP layer
```

Replace the hardcoded response in `server.py`'s loop with:

```python
    response_bytes = handle_request(parsed)
    client_socket.sendall(response_bytes)
```

### SAVE AND TRY

```bash
curl -i http://localhost:8080/nonexistent
```

**Expected:**
```
=== Routing: 404 for Unknown Paths ===
GET /nonexistent -> 404 Not Found
```

(`curl -i` shows the response headers too — confirm `HTTP/1.1 404 Not Found` is the first line.)

**Confirm `handle_request` is a dispatch point (LAB-09's pattern), not yet a dispatch TABLE:** Right now it's an `if/else` chain — for two paths, that's fine, but this is EXACTLY the shape LAB-45's real router will replace with something more scalable, once the number of routes grows past a handful, the same evolution LAB-09's calculator went through toward a dispatch table.

---

## 🎯 Challenge: Serve a Real Static File

**You know:** A response body can be ANY text — including the contents of a real file read from disk.

**Task:** Add a route that reads an actual HTML file from disk and serves it with the correct `Content-Type: text/html` and a correctly computed `Content-Length`.

<details>
<summary>▶ Show Solution</summary>

```python
def handle_request(parsed: dict) -> bytes:
    if parsed['path'] == '/':
        return build_response(200, 'OK', 'Hello, World!\n')
    elif parsed['path'] == '/page.html':
        try:
            with open('page.html', 'r') as f:
                content = f.read()
            return build_response(200, 'OK', content, content_type='text/html')
        except FileNotFoundError:
            return build_response(404, 'Not Found', '404: page.html not found on disk\n')
    else:
        return build_response(404, 'Not Found', f"404: {parsed['path']} not found\n")
```

Create `page.html`:
```html
<!DOCTYPE html>
<html><body><h1>Served from raw sockets!</h1></body></html>
```

**Key insight:** `content_type='text/html'` is the ONLY thing that tells the BROWSER to render this as a formatted page instead of showing the raw HTML tags as plain text — the `Content-Type` header is a CONTRACT between server and client about how to INTERPRET the bytes that follow, not just decoration. Get it wrong (serve HTML as `text/plain`), and a browser will show literal `<h1>` tags on screen instead of rendering a heading.

</details>

### SAVE AND TRY

```bash
curl -i http://localhost:8080/page.html
```

**Expected:**
```
=== Serving a Static File ===
GET /page.html -> 200 OK, Content-Type: text/html, Content-Length: 87
```

Visit `http://localhost:8080/page.html` in a browser — confirm it renders as a formatted heading, not raw HTML text.

---

## Mental Model: What Every Web Framework Automates

| This lab, by hand | What FastAPI/Express automate |
|---|---|
| `socket.accept()`, `recv()`, `sendall()` | The framework's built-in HTTP server |
| `parse_request` | Automatic request parsing — `request.method`, `request.headers`, etc. |
| `build_response` with manual `Content-Length` | `return {"message": "hi"}` — the framework computes headers for you |
| `if path == '/': ... elif ...` | `@app.get("/")` route decorators — a real dispatch table |

**Where you will see this again:** LAB-45 (REST API) introduces FastAPI — everything it does automatically will now make sense, because you built the manual version first. LAB-5.1 (engineering-drills' "HTTP From Raw Sockets") is this exact lab's sibling, if you want an even deeper dive.

---

## Final Check

| Feature | How to verify |
|---|---|
| The server correctly reads and displays a raw incoming HTTP request | Step 1 |
| `parse_request` correctly extracts method, path, version, and headers | Step 2 |
| A hand-built response with correct headers renders in a real browser | Step 3 |
| Unknown paths return a 404, known paths return 200 | Step 4 |
| A real file is served from disk with correct `Content-Type` and `Content-Length` | Challenge |
| You can explain, without notes, why `Content-Length` is necessary | Concept box |

---

## Quick Check Answers

**1. What tool, with zero HTTP-specific code, lets you type a request manually?**

`telnet` (or `nc`/netcat) — either one just opens a raw TCP text connection with no understanding of HTTP whatsoever; YOU type the exact HTTP-formatted text (including the required blank line), and the tool has no idea it's "doing HTTP" at all — it's just sending and receiving bytes, exactly like this lab's Python `socket` code does programmatically.

**2. `GET /users HTTP/1.1` — what are the three pieces?**

The METHOD (`GET` — what kind of action: retrieve, create, update, delete), the PATH (`/users` — which resource, on this server, the request concerns), and the VERSION (`HTTP/1.1` — which revision of the HTTP protocol format the rest of the message follows). Step 2's `parse_request` split exactly these three pieces out of the request line by splitting on spaces.

**3. Why does a response need `Content-Length`?**

Without it, the client has no reliable way to know where the BODY ends — should it keep reading from the socket forever, waiting for more data that may never come? `Content-Length: 13` (Step 3) tells the client EXACTLY how many bytes of body to expect after the blank line, so it can stop reading confidently the moment it has received that many bytes, rather than guessing or hanging indefinitely.

---

*Next: [LAB-45 — REST API Design](LAB-45-rest-api.md) — Python (FastAPI), same module*
