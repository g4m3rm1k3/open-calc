# Drill 5.1 — HTTP From Raw Sockets

**Standalone drill. No prerequisites beyond basic Python.**
**Time estimate:** 90–120 minutes
**What you will build:** An HTTP/1.1 server using only Python's `socket` module — zero frameworks
**What you will understand:** HTTP is text. Every framework is a program that reads and writes strings in a specific format.

---

## Quick Check

Read these questions now. Answer them yourself before starting.
You will find the answers in this lab — they reference specific code you will write.

1. An HTTP request starts with a "request line." What are the three components of that line, and what character sequence separates each line in the HTTP message?

2. You make a request to a server at `http://example.com/about`. The server responds with `HTTP/1.1 200 OK` and a body. What would the response look like if the `Content-Length` header were wrong (too short)? What would the browser do?

3. HTTP/1.1 keeps connections alive by default. If your raw socket server sends a response and then does nothing, what happens to the browser? What header do you send to tell the browser the connection is finished?

4. You type `flask run` and visit `http://localhost:5000`. Flask does not do anything magic. What is Flask actually doing at the lowest level that makes HTTP requests arrive at your Python code?

*(Answers at the bottom of this lab, referenced to the exact code that proves each one.)*

---

## The Concept: HTTP is Text on a Wire

### Concept: The HTTP Message Format

**What it is:**
HTTP (HyperText Transfer Protocol) is a text-based protocol that runs over TCP. A request is a string. A response is a string. Both strings follow a precise format: a start line, headers (one per line), a blank line, and an optional body. The browser sends this string to the server. The server sends a string back. That is the entire protocol.

**The problem before:**
You use `requests.get('http://example.com')` or `fetch('/api/data')` and it works. But you have no model for what is actually being transmitted. Headers, status codes, and methods feel like abstract concepts that libraries "handle." When something goes wrong — a CORS error, a 415 Unsupported Media Type, a connection hanging — you have no frame of reference to debug it.

**The solution:**
Read the raw bytes. Write the raw bytes. Once you have typed `HTTP/1.1 200 OK\r\nContent-Length: 13\r\n\r\nHello, World!` by hand, every HTTP concept becomes concrete. Status codes are just numbers in a string. Headers are just key-value pairs separated by `: `. The blank line is just `\r\n\r\n`. Nothing is magic.

**What it hides:**
`requests`, `fetch`, `axios`, Flask, FastAPI, Express — all of these libraries are wrapping a socket. They call `socket.connect()`, format a string like the one you will write by hand, call `socket.send()`, call `socket.recv()`, and parse the response string back into objects. The abstraction is useful. But you cannot debug what you do not understand.

**Canonical example (general):**
A telegram. A telegram has a specific format: recipient address, then the message, then STOP to end sentences. Anyone who knows the format can write one. Anyone who knows the format can read one. The telegram office is just a system that moves strings in that format. HTTP is the same — a precise string format that both sides agree on.

**Project application:**
In Step 1, you will act as an HTTP client: open a raw TCP socket, write the HTTP request string, and read back Google's response string. You will see the protocol naked. In Steps 2–5, you will be the server: accept a socket, read the request string, write a response string.

**Constraints:**
- Lines in HTTP are separated by `\r\n` (carriage return + line feed, ASCII 13 + 10) — not just `\n`
- The blank line separating headers from body is `\r\n\r\n` (two CRLFs in a row)
- Header names are case-insensitive by spec, but use conventional casing (e.g., `Content-Type`)
- HTTP/1.1 requires a `Host` header in every request

**Failure modes:**
- Using `\n` instead of `\r\n` — some servers accept it, others reject the request silently
- Sending the wrong `Content-Length` — the client reads exactly that many bytes for the body, then either stops early (truncated body) or hangs waiting for more bytes that never arrive
- Not sending `Connection: close` on an HTTP/1.1 server that does not support keep-alive — the browser sends a second request and your server reads garbage because it is not handling sequential requests correctly

**Operational reality:**
The HTTP/1.1 specification (RFC 7230) is 89 pages. Flask's `werkzeug` HTTP parser is about 3,000 lines of Python. FastAPI uses `starlette`, which uses `uvicorn`, which uses `httptools` (a C extension wrapping the Node.js HTTP parser). All of it parses the same string format you will write by hand in this lab. The complexity is in edge cases: chunked transfer encoding, pipelining, multipart bodies, trailer headers. The core is simple.

**You will see this again in:**
Every networking course, every backend framework, every API debugging session. `curl -v` shows you the raw HTTP exchange. Chrome DevTools Network tab shows you headers and bodies. Wireshark shows you the raw bytes. Understanding the format lets you read any of these tools fluently.

---

### Concept: TCP Sockets — The Plumbing Under HTTP

**What it is:**
A socket is a file-like object that represents one end of a network connection. You call `socket.connect(host, port)` to establish a TCP connection to a server. Then you `send()` bytes and `recv()` bytes. The socket does not know or care about HTTP — it just moves bytes.

**The problem before:**
Networking feels like a black box controlled entirely by libraries. You import `requests` and call `.get()` and data appears. You have no model of what a "connection" is or why it takes time to establish one.

**The solution:**
`socket.socket()` gives you a raw file descriptor connected to the kernel's TCP stack. `connect()` performs the TCP three-way handshake (SYN, SYN-ACK, ACK). `send()` writes bytes to the OS send buffer; the OS handles segmentation, retransmission, and delivery. `recv()` reads bytes from the OS receive buffer as they arrive. HTTP runs entirely inside this pipe.

**What it hides:**
The TCP layer handles reliability: if packets are lost, TCP retransmits them. If packets arrive out of order, TCP reorders them. By the time your `recv()` call returns bytes, they are already in order and complete. HTTP relies entirely on this guarantee.

**Constraints:**
- `recv(n)` reads *up to* `n` bytes — it may return fewer if the buffer is not full yet
- A server must call `bind()` to claim a port, `listen()` to mark the socket as accepting connections, and `accept()` to get a new socket for each connected client
- Port numbers below 1024 require root/admin privileges on most operating systems

**Failure modes:**
- `recv()` returning `b''` (empty bytes) means the remote side closed the connection
- Calling `recv()` once and assuming you received the entire HTTP request — for large requests, you need to loop until you see `\r\n\r\n`
- Forgetting to call `socket.close()` — the OS keeps the socket open, consuming a file descriptor

**Operational reality:**
Production servers use `select()`, `epoll()` (Linux), or `kqueue()` (macOS) to handle thousands of simultaneous connections without blocking. Python's `asyncio` wraps these. For this lab, one connection at a time is sufficient to understand the fundamentals.

**You will see this again in:**
Database drivers (psycopg2, pymysql) — they open a socket to the database port. Redis clients — socket to port 6379. SMTP email sending — socket to port 25 or 587. All network I/O is ultimately a socket.

---

### Concept: HTTP Status Codes and Response Structure

**What it is:**
Every HTTP response starts with a status line: the protocol version, a three-digit status code, and a human-readable reason phrase. The status code tells the client what happened. The reason phrase is informational only — the client should use the code number, not the text.

**The problem before:**
Status codes feel like a list to memorize. You know 200 means good and 404 means not found. You do not know why they matter structurally or what happens if you send the wrong one.

**The solution:**
The status code is the first thing the client reads. The browser decides whether to render the body, follow a redirect, show an error page, or retry — entirely based on the code number. A `301 Moved Permanently` without a `Location` header is malformed. A `204 No Content` must have no body. Writing them by hand makes the semantics concrete.

**What it hides:**
Frameworks return status codes automatically: Flask returns 200 by default, 404 when you `abort(404)`, 500 on unhandled exceptions. These are just numbers being formatted into the response string.

**Constraints:**
- 1xx: Informational (connection continues)
- 2xx: Success (request was received, understood, and accepted)
- 3xx: Redirection (further action needed)
- 4xx: Client error (bad request, not found, unauthorized)
- 5xx: Server error (server failed to fulfill a valid request)

**Failure modes:**
Sending `200 OK` for a resource that does not exist — the client will try to parse the error body as valid content. Sending `404` for a request that succeeded — the client may cache the "not found" result and never retry.

**Operational reality:**
HTTP caching, CDNs, and load balancers make routing decisions based on status codes. A `200` response can be cached; a `500` response should not be. Load balancers remove unhealthy servers from the pool when they return 5xx codes consistently.

**You will see this again in:**
Every API you write or consume. REST API design conventions, FastAPI's automatic status code handling, browser caching behavior — all built on the semantics of these numbers.

---

## Step 1 — Act as a Client: Make a Raw HTTP Request

**Goal:** See what HTTP looks like on the wire by acting as the client yourself. Connect to a real web server using only `socket`, send a handcrafted request string, and read the raw response.

Create your working directory and first file:

```
5.1-http-sockets/
    client.py
```

**`client.py`:**

```python
import socket

# Create a TCP socket
# AF_INET = IPv4 address family
# SOCK_STREAM = TCP (stream socket, reliable, ordered)
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Connect to Google's web server on port 80 (plain HTTP, not HTTPS)
# This performs the TCP three-way handshake:
#   Your machine sends SYN
#   Google's server sends SYN-ACK
#   Your machine sends ACK
#   Connection is now established
sock.connect(('google.com', 80))

# Build the HTTP request as a string, then encode it to bytes
# HTTP requires \r\n (CRLF) line endings — not just \n
# The format is:
#   METHOD /path HTTP/version\r\n
#   Header: value\r\n
#   Header: value\r\n
#   \r\n                      ← blank line marks end of headers
#   body (optional)
#
# HTTP/1.1 requires a Host header — the server needs it to know which
# virtual host you are requesting (one IP address can serve many domains)
request = (
    "GET / HTTP/1.1\r\n"          # Request line: method, path, version
    "Host: google.com\r\n"        # Required header: which host we want
    "Connection: close\r\n"       # Tell server to close after response
                                  # Without this, HTTP/1.1 keeps the connection
                                  # alive and recv() will hang waiting for more
    "\r\n"                        # Blank line: end of headers, no body
)

# Convert the string to bytes (HTTP is bytes on the wire, not a Python str)
# encode() uses UTF-8 by default, which is ASCII for these characters
sock.send(request.encode())

print("=== RAW REQUEST SENT ===")
print(repr(request))
# repr() shows the \r\n escape sequences so you can see them explicitly
# Without repr(), print() renders them as actual whitespace

print("\n=== RAW RESPONSE RECEIVED ===")

# Read the response in chunks
# recv(4096) reads up to 4096 bytes at a time
# Loop until the server closes the connection (recv returns b'')
response = b""
while True:
    chunk = sock.recv(4096)
    if not chunk:          # Empty bytes = connection closed by server
        break
    response += chunk

sock.close()

# Print the raw bytes as a string so you can read it
# decode() converts bytes back to a Python string
# errors='replace' prevents crashes if the response contains non-UTF-8 bytes
# (some responses contain binary data or non-ASCII characters)
print(response.decode(errors='replace'))

print("\n=== RESPONSE BREAKDOWN ===")
# Split the response into headers and body at the blank line
# The blank line in HTTP is \r\n\r\n
if b'\r\n\r\n' in response:
    header_section, body = response.split(b'\r\n\r\n', 1)
    headers = header_section.split(b'\r\n')

    print(f"Status line: {headers[0].decode()}")
    print(f"Number of response headers: {len(headers) - 1}")
    print(f"Body length (bytes): {len(body)}")
    print(f"\nAll response headers:")
    for header in headers[1:]:
        print(f"  {header.decode()}")
```

**SAVE AND TRY:**

```
python client.py
```

**Exact expected output structure** (values vary but structure is fixed):

```
=== RAW REQUEST SENT ===
'GET / HTTP/1.1\r\nHost: google.com\r\nConnection: close\r\n\r\n'

=== RAW RESPONSE RECEIVED ===
HTTP/1.1 301 Moved Permanently
Location: http://www.google.com/
Content-Type: text/html; charset=UTF-8
... (more headers)
... (HTML body)

=== RESPONSE BREAKDOWN ===
Status line: HTTP/1.1 301 Moved Permanently
Number of response headers: 8
Body length (bytes): 219
...
```

Google returns `301 Moved Permanently` redirecting to `www.google.com`. You just received a real HTTP redirect — and you can see exactly what the redirect looks like: a `Location` header containing the new URL. Browsers follow this automatically. You just read it as raw text.

**Terminal verification:**

```bash
# Compare your raw socket output with curl's verbose mode
# curl -v shows the raw request and response headers
curl -v http://google.com 2>&1 | head -30
```

You will see curl's output starts with `>` lines (the request it sent) and `<` lines (the response it received). These are the same strings your `client.py` is sending and receiving. curl is doing exactly what your code does — it is just handling redirects and HTTPS automatically.

**Change something — experiment:**

Remove the `Connection: close` header from your request (delete that line). Run `client.py` again. The script will hang after receiving the response and never print `=== RESPONSE BREAKDOWN ===`. You will need to press `Ctrl+C` to stop it.

This is because HTTP/1.1 defaults to keep-alive: the server sent its response but left the connection open, waiting for your next request. Your `recv()` loop is waiting for more data that will never arrive because the server is also waiting. `Connection: close` tells the server to close the connection after sending the response, which makes your `recv()` loop exit cleanly.

Restore the `Connection: close` header before continuing.

---

## Step 2 — Build the Server Socket

**Goal:** Create a TCP server that accepts connections. No HTTP yet — just the socket infrastructure.

Add a new file:

```
5.1-http-sockets/
    client.py
    server.py       ← new
```

**`server.py`:**

```python
import socket

# Create a TCP server socket (same type as the client socket)
server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# SO_REUSEADDR lets us restart the server immediately after stopping it
# Without this, the OS keeps the port reserved for ~60 seconds after the process exits
# (TIME_WAIT state in TCP — the OS waits to handle delayed packets from the old connection)
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# Bind: claim a port on this machine
# '' (empty string) = listen on all network interfaces
# 8080 = the port number (above 1024, so no root required)
# After bind(), this port is reserved — nothing else can use it
server_sock.bind(('', 8080))

# Listen: mark this socket as one that accepts incoming connections
# The argument (5) is the backlog — how many connections the OS will queue
# while we are busy handling one before refusing new ones
# This does NOT mean we handle 5 simultaneously — it's just an OS queue
server_sock.listen(5)

print("Server listening on http://localhost:8080")
print("Press Ctrl+C to stop")

# Main server loop
# We handle one connection at a time (sequential, not concurrent)
while True:
    # accept() blocks until a client connects
    # It returns two values:
    #   conn: a NEW socket object for this specific connection
    #         (the server_sock keeps listening; conn is just for this client)
    #   addr: a tuple (ip_address, port_number) of the client
    conn, addr = server_sock.accept()
    print(f"\nConnection from {addr[0]}:{addr[1]}")

    # Read whatever the client sent
    # For a browser, this will be an HTTP request
    # We read up to 4096 bytes — enough for a typical request
    raw_request = conn.recv(4096)
    print("=== RAW REQUEST ===")
    print(raw_request.decode(errors='replace'))

    # Send a minimal HTTP response — just to prove the socket works
    # We will parse the request and build a proper response in later steps
    response = (
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/plain\r\n"
        "Content-Length: 13\r\n"  # 13 = len("Hello, World!")
        "Connection: close\r\n"
        "\r\n"
        "Hello, World!"
    )
    conn.send(response.encode())

    # Close this client's connection
    # The server_sock stays open, listening for the next client
    conn.close()
```

**SAVE AND TRY:**

Open two terminals. In terminal 1:

```
python server.py
```

Expected output:
```
Server listening on http://localhost:8080
Press Ctrl+C to stop
```

In terminal 2, make a request using curl:

```
curl http://localhost:8080
```

**Exact expected output in curl terminal:**
```
Hello, World!
```

**Exact expected output in server terminal:**
```
Connection from 127.0.0.1:XXXXX

=== RAW REQUEST ===
GET / HTTP/1.1
Host: localhost:8080
User-Agent: curl/7.XX.X
Accept: */*
```

Read the raw request carefully. `GET / HTTP/1.1` is the request line. Then you see headers. This is the string that curl built and sent over the socket. Your server received it as raw bytes, decoded it to a string, and printed it.

**Terminal verification — verbose mode:**

```
curl -v http://localhost:8080
```

The `-v` flag shows:
- Lines starting with `>` are what curl sent (your server received these)
- Lines starting with `<` are what your server sent back (curl received these)
- The line `< HTTP/1.1 200 OK` is the first line of your `response` string

Also open a browser and visit `http://localhost:8080`. Your browser will make an HTTP request and display "Hello, World!". Check the server terminal — you will see two requests arrive (one is often the browser fetching `/favicon.ico`).

**Change something — experiment:**

Change `Content-Length: 13` to `Content-Length: 5` in your response. Run the server, then:

```
curl http://localhost:8080
```

curl will only display the first 5 bytes of the body: `Hello`. The rest of the string is transmitted but the client ignores it because `Content-Length` said the body ends after 5 bytes. This is how `Content-Length` works — it is the client's rule for when to stop reading the body.

Restore the correct value before continuing.

---

## Step 3 — Parse the HTTP Request

**Goal:** Read the request line and headers properly. Extract the method and path.

Update `server.py`:

```python
import socket

def parse_request(raw_bytes):
    """
    Parse an HTTP request from raw bytes.
    Returns (method, path, headers_dict) or raises ValueError if malformed.

    HTTP request format:
        METHOD /path HTTP/version\r\n
        Header-Name: header-value\r\n
        Header-Name: header-value\r\n
        \r\n
        (optional body)

    We split on \r\n\r\n to separate headers from body.
    We split on \r\n to get individual header lines.
    We split the first line on spaces to get method, path, version.
    """
    # Decode bytes to string
    # errors='replace' handles malformed bytes without crashing
    text = raw_bytes.decode(errors='replace')

    # Split headers from body at the blank line (\r\n\r\n)
    # maxsplit=1 means split only at the FIRST blank line
    # (the body itself might contain \r\n\r\n and we do not want to split there)
    if '\r\n\r\n' not in text:
        raise ValueError("Malformed request: no blank line found")

    header_section, body = text.split('\r\n\r\n', 1)

    # Split the header section into individual lines
    lines = header_section.split('\r\n')

    # The first line is the request line: "GET /path HTTP/1.1"
    # The rest are headers: "Header-Name: value"
    request_line = lines[0]
    header_lines = lines[1:]

    # Parse the request line
    # split() with no argument splits on any whitespace
    # We expect exactly three parts
    parts = request_line.split()
    if len(parts) != 3:
        raise ValueError(f"Malformed request line: {repr(request_line)}")

    method = parts[0]    # e.g., "GET", "POST", "PUT", "DELETE"
    path   = parts[1]    # e.g., "/", "/about", "/api/users"
    version = parts[2]   # e.g., "HTTP/1.1"

    # Parse headers into a dictionary
    # Header format: "Name: value"
    # We strip whitespace from both sides to handle optional spaces
    headers = {}
    for line in header_lines:
        if ':' in line:
            name, value = line.split(':', 1)    # split on FIRST colon only
                                                # (header values can contain colons)
            headers[name.strip().lower()] = value.strip()
            # We lowercase the name — HTTP headers are case-insensitive

    return method, path, headers, body

server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_sock.bind(('', 8080))
server_sock.listen(5)

print("Server listening on http://localhost:8080")
print("Press Ctrl+C to stop")

while True:
    conn, addr = server_sock.accept()
    raw_request = conn.recv(4096)

    try:
        method, path, headers, body = parse_request(raw_request)
        print(f"\n{method} {path}")
        print(f"  Host: {headers.get('host', '(not sent)')}")
        print(f"  User-Agent: {headers.get('user-agent', '(not sent)')}")
    except ValueError as e:
        print(f"\nMalformed request: {e}")
        conn.close()
        continue

    # For now, always respond 200
    response_body = f"<h1>You requested: {path}</h1>"
    response = (
        f"HTTP/1.1 200 OK\r\n"
        f"Content-Type: text/html\r\n"
        f"Content-Length: {len(response_body)}\r\n"
        f"Connection: close\r\n"
        f"\r\n"
        f"{response_body}"
    )
    conn.send(response.encode())
    conn.close()
```

**SAVE AND TRY:**

```
python server.py
```

In another terminal:

```
curl http://localhost:8080/
curl http://localhost:8080/about
curl http://localhost:8080/api/users/42
```

**Exact expected server output:**
```
GET /
  Host: localhost:8080
  User-Agent: curl/7.XX.X

GET /about
  Host: localhost:8080
  User-Agent: curl/7.XX.X

GET /api/users/42
  Host: localhost:8080
  User-Agent: curl/7.XX.X
```

**Exact expected curl output** (for `/about`):
```
<h1>You requested: /about</h1>
```

**Terminal verification:**

```
curl -v http://localhost:8080/test-path 2>&1
```

Find the line `< HTTP/1.1 200 OK` in curl's output. That is your status line, sent by your server. Find `< Content-Length:` — that is the byte count your code calculated with `len(response_body)`. These are the exact strings your `server.py` formatted and sent through the socket.

**Change something — experiment:**

In curl, add a custom header:

```
curl -H "X-My-Header: hello" http://localhost:8080/
```

Your server already parses all headers into a dictionary. Print `headers` in `parse_request` (just temporarily add `print(headers)` after building it) and re-run. You will see your custom header appear in the dictionary: `{'host': 'localhost:8080', 'user-agent': 'curl/7.XX.X', 'accept': '*/*', 'x-my-header': 'hello'}`. Every framework's request object (Flask's `request.headers`, FastAPI's `Request.headers`) is just a dictionary built exactly this way.

---

## Step 4 — Serve a Static File

**Goal:** Read an HTML file from disk and serve it as the response body. Build the correct headers.

Create the HTML file:

```
5.1-http-sockets/
    client.py
    server.py
    index.html      ← new
```

**`index.html`:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Raw Socket Server</title>
    <style>
        body { font-family: monospace; background: #1a1a1a; color: #00ff00; padding: 2rem; }
        h1 { color: #ffffff; }
        .info { border: 1px solid #00ff00; padding: 1rem; margin: 1rem 0; }
    </style>
</head>
<body>
    <h1>Served by a raw Python socket</h1>
    <div class="info">
        <p>No Flask. No FastAPI. No framework.</p>
        <p>Just <code>socket.socket()</code>, <code>bind()</code>, <code>listen()</code>, <code>accept()</code>.</p>
        <p>This HTML was read from disk and placed after the HTTP headers.</p>
    </div>
</body>
</html>
```

Update `server.py` with file serving:

```python
import socket
import os

def parse_request(raw_bytes):
    text = raw_bytes.decode(errors='replace')
    if '\r\n\r\n' not in text:
        raise ValueError("Malformed request: no blank line")
    header_section, body = text.split('\r\n\r\n', 1)
    lines = header_section.split('\r\n')
    request_line = lines[0]
    header_lines = lines[1:]
    parts = request_line.split()
    if len(parts) != 3:
        raise ValueError(f"Malformed request line: {repr(request_line)}")
    method, path, version = parts
    headers = {}
    for line in header_lines:
        if ':' in line:
            name, value = line.split(':', 1)
            headers[name.strip().lower()] = value.strip()
    return method, path, headers, body

def serve_file(path):
    """
    Read a file from disk and build an HTTP 200 response.
    Returns the complete response as bytes.

    The response format:
        HTTP/1.1 200 OK\r\n
        Content-Type: text/html\r\n
        Content-Length: <number of bytes in file>\r\n
        Connection: close\r\n
        \r\n
        <file contents as bytes>

    Content-Length MUST be the byte count of the body (not character count).
    For ASCII files they are the same. For UTF-8 files with non-ASCII
    characters, len(string) != len(string.encode('utf-8')).
    Always compute Content-Length from the bytes, not the string.
    """
    with open(path, 'rb') as f:    # Open in binary mode — we want the raw bytes
        body_bytes = f.read()

    # Content-Length is always the byte count
    content_length = len(body_bytes)

    # Build the response headers as a string, then encode to bytes
    # We join headers and body with bytes concatenation because the body is binary
    header_str = (
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/html\r\n"
        f"Content-Length: {content_length}\r\n"
        "Connection: close\r\n"
        "\r\n"
    )

    # The response is: encoded headers + raw file bytes
    # We concatenate bytes, not strings — the body stays binary
    return header_str.encode() + body_bytes

def not_found_response():
    """
    Build an HTTP 404 response.

    The status code 404 (Not Found) is just a number in the status line.
    The body is an HTML page explaining the error — the status code alone
    is not visible to users unless the browser chooses to show it.

    The blank line (\r\n\r\n) after the headers is mandatory even for
    error responses. Without it, the client cannot tell where headers end.
    """
    body = "<h1>404 Not Found</h1><p>The page you requested does not exist.</p>"
    body_bytes = body.encode()
    header_str = (
        "HTTP/1.1 404 Not Found\r\n"
        "Content-Type: text/html\r\n"
        f"Content-Length: {len(body_bytes)}\r\n"
        "Connection: close\r\n"
        "\r\n"
    )
    return header_str.encode() + body_bytes

server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_sock.bind(('', 8080))
server_sock.listen(5)

# The directory where this script lives — we will serve files relative to this
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print(f"Server listening on http://localhost:8080")
print(f"Serving files from: {BASE_DIR}")
print("Press Ctrl+C to stop\n")

while True:
    conn, addr = server_sock.accept()
    raw_request = conn.recv(4096)

    if not raw_request:
        conn.close()
        continue

    try:
        method, path, headers, body = parse_request(raw_request)
    except ValueError as e:
        print(f"Malformed request: {e}")
        conn.close()
        continue

    print(f"{method} {path}")

    # Route: only serve GET requests at /
    if method == "GET" and path == "/":
        file_path = os.path.join(BASE_DIR, "index.html")

        if os.path.exists(file_path):
            response = serve_file(file_path)
            print(f"  → 200 OK (serving {file_path})")
        else:
            response = not_found_response()
            print(f"  → 404 Not Found (index.html missing)")
    else:
        # Any other path or method gets a 404
        response = not_found_response()
        print(f"  → 404 Not Found")

    conn.send(response)
    conn.close()
```

**SAVE AND TRY:**

```
python server.py
```

In browser: visit `http://localhost:8080`

**Exact expected browser output:** A dark-background page with green text reading "Served by a raw Python socket" and the info box below it.

**Exact expected server output:**
```
Server listening on http://localhost:8080
Serving files from: /path/to/5.1-http-sockets

GET /
  → 200 OK (serving /path/to/5.1-http-sockets/index.html)
GET /favicon.ico
  → 404 Not Found
```

The browser automatically requests `/favicon.ico` (the small icon shown in the browser tab). Your server correctly returns 404 for it.

**Terminal verification:**

```bash
# curl -v shows the raw exchange including the Content-Length the server computed
curl -v http://localhost:8080 2>&1

# Count the bytes in index.html yourself
wc -c index.html
# (on Windows: (Get-Content index.html -Raw -Encoding byte).Length)
```

The `Content-Length` in the response should match `wc -c index.html` exactly. If they differ, the browser will truncate the body or hang waiting for more bytes.

```bash
# Inspect the response headers using curl's -I flag (HEAD request variant)
curl -I http://localhost:8080
```

You will see only the headers, no body. Note: your server sends full responses even to HEAD requests — proper servers send only headers for HEAD. This is a known simplification.

**Change something — experiment:**

Edit `index.html` — add a paragraph of text. Make the file longer. Visit `http://localhost:8080` in the browser. Without restarting the server, it serves the updated file immediately, because `serve_file()` reads the file fresh on every request. This is the behavior of a development server. Production servers often cache file contents. Flask's development mode reads files fresh; production deployments use a cache or serve static files through nginx.

---

## Step 5 — Handle Multiple Routes and 404

**Goal:** Add proper routing. Unknown paths return a real 404. The browser and curl should both show the correct status.

This step replaces the routing block only. The full final `server.py`:

```python
import socket
import os

def parse_request(raw_bytes):
    text = raw_bytes.decode(errors='replace')
    if '\r\n\r\n' not in text:
        raise ValueError("Malformed request: no blank line")
    header_section, body = text.split('\r\n\r\n', 1)
    lines = header_section.split('\r\n')
    parts = lines[0].split()
    if len(parts) != 3:
        raise ValueError(f"Malformed request line: {repr(lines[0])}")
    method, path, version = parts
    headers = {}
    for line in lines[1:]:
        if ':' in line:
            name, value = line.split(':', 1)
            headers[name.strip().lower()] = value.strip()
    return method, path, headers, body

def make_response(status_code, status_text, content_type, body_bytes):
    """
    Build a complete HTTP response from its components.

    This function makes the response structure explicit:
        status_line\r\n
        header1\r\n
        header2\r\n
        \r\n
        body

    Every framework's response builder does exactly this.
    Flask's Response class, FastAPI's JSONResponse, Express's res.send()
    — all of them are building this exact string.

    Parameters:
        status_code: int, e.g. 200, 404, 500
        status_text: str, e.g. "OK", "Not Found", "Internal Server Error"
        content_type: str, e.g. "text/html", "application/json"
        body_bytes: bytes — the response body

    Returns bytes ready to send through a socket.
    """
    headers = (
        f"HTTP/1.1 {status_code} {status_text}\r\n"
        f"Content-Type: {content_type}\r\n"
        f"Content-Length: {len(body_bytes)}\r\n"
        f"Connection: close\r\n"
        f"\r\n"
    )
    return headers.encode() + body_bytes

# Define routes as a dictionary: path → handler function
# Each handler takes (method, headers, body) and returns (status_code, status_text, content_type, body_bytes)
def handle_root(method, headers, body):
    """Serve the index.html file."""
    file_path = os.path.join(BASE_DIR, "index.html")
    if not os.path.exists(file_path):
        return 404, "Not Found", "text/html", b"<h1>index.html not found</h1>"
    with open(file_path, 'rb') as f:
        content = f.read()
    return 200, "OK", "text/html", content

def handle_about(method, headers, body):
    """Return a simple about page as a string — no file needed."""
    html = """
    <html><body>
    <h1>About This Server</h1>
    <p>This server was built using only Python's socket module.</p>
    <p>No Flask. No FastAPI. No Starlette. No Uvicorn. No Gunicorn.</p>
    <p>Just <code>socket.socket(socket.AF_INET, socket.SOCK_STREAM)</code>.</p>
    </body></html>
    """.strip()
    return 200, "OK", "text/html", html.encode()

def handle_api_status(method, headers, body):
    """Return JSON — demonstrating that Content-Type controls interpretation, not magic."""
    # JSON is just a string. The Content-Type header tells the client how to parse it.
    # The browser's fetch() will automatically parse the body as JSON
    # when Content-Type is application/json. This is why Content-Type matters.
    import json
    data = {
        "server": "raw-socket-server",
        "framework": None,
        "python_socket": True,
        "status": "running"
    }
    json_bytes = json.dumps(data).encode()
    return 200, "OK", "application/json", json_bytes

# Route table: maps paths to handler functions
# This is what Flask's @app.route('/path') decorator builds — a dict lookup
ROUTES = {
    "/": handle_root,
    "/about": handle_about,
    "/api/status": handle_api_status,
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_sock.bind(('', 8080))
server_sock.listen(5)

print("Server listening on http://localhost:8080")
print("Routes:")
for route in ROUTES:
    print(f"  GET {route}")
print("Press Ctrl+C to stop\n")

while True:
    conn, addr = server_sock.accept()
    raw_request = conn.recv(4096)

    if not raw_request:
        conn.close()
        continue

    try:
        method, path, headers, body = parse_request(raw_request)
    except ValueError as e:
        error_body = f"<h1>Bad Request</h1><p>{e}</p>".encode()
        conn.send(make_response(400, "Bad Request", "text/html", error_body))
        conn.close()
        continue

    # Route lookup: find the handler for this path
    handler = ROUTES.get(path)

    if handler is None:
        # No route found — return 404
        not_found_body = (
            f"<h1>404 Not Found</h1>"
            f"<p>No route for <code>{path}</code></p>"
            f"<p>Available routes: {list(ROUTES.keys())}</p>"
        ).encode()
        response = make_response(404, "Not Found", "text/html", not_found_body)
        status_log = "404"
    else:
        # Call the handler — it returns the response components
        status_code, status_text, content_type, response_body = handler(method, headers, body)
        response = make_response(status_code, status_text, content_type, response_body)
        status_log = str(status_code)

    print(f"{method} {path} → {status_log}")
    conn.send(response)
    conn.close()
```

**SAVE AND TRY:**

```
python server.py
```

In terminal 2, test all routes:

```bash
curl http://localhost:8080/
curl http://localhost:8080/about
curl http://localhost:8080/api/status
curl http://localhost:8080/does-not-exist
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/missing
```

**Exact expected outputs:**

```
# curl http://localhost:8080/about
<html><body>
<h1>About This Server</h1>
...

# curl http://localhost:8080/api/status
{"server": "raw-socket-server", "framework": null, "python_socket": true, "status": "running"}

# curl http://localhost:8080/does-not-exist
<h1>404 Not Found</h1><p>No route for <code>/does-not-exist</code></p>...

# curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/missing
404
```

**Server terminal:**
```
GET / → 200
GET /about → 200
GET /api/status → 200
GET /does-not-exist → 404
GET /missing → 404
```

**Terminal verification — see raw request and response for the 404:**

```bash
curl -v http://localhost:8080/no-such-page 2>&1
```

Find `< HTTP/1.1 404 Not Found` in the output. That is the literal string your `make_response(404, "Not Found", ...)` built and sent through the socket. The browser, curl, and any HTTP client read this status code number and decide what to do — curl prints the body anyway, browsers typically show a styled error page for 4xx responses.

**Change something — experiment:**

Add a new route to `ROUTES` without touching the server loop:

```python
def handle_echo(method, headers, body):
    html = f"<h1>Echo</h1><pre>Method: {method}\nHeaders:\n"
    for k, v in headers.items():
        html += f"  {k}: {v}\n"
    html += "</pre>"
    return 200, "OK", "text/html", html.encode()

ROUTES["/echo"] = handle_echo
```

Visit `http://localhost:8080/echo` in your browser. You will see the browser's own request headers reflected back — User-Agent, Accept, Accept-Language, Accept-Encoding. Flask's `request.headers` dictionary is built from exactly these strings.

---

## Step 6 — Verify With curl and Browser

**Goal:** Use `curl -v` to see the full raw exchange and understand every line.

This step uses the server from Step 5 without code changes.

**SAVE AND TRY:**

```
python server.py
```

Run each curl command and read the output carefully:

**Test 1: Full verbose exchange for the root route:**

```bash
curl -v http://localhost:8080/ 2>&1
```

**Exact expected output format:**
```
* Trying 127.0.0.1:8080...
* Connected to localhost (127.0.0.1) port 8080
> GET / HTTP/1.1                    ← your server receives this line
> Host: localhost:8080               ← your server receives this header
> User-Agent: curl/7.XX.X           ← your server receives this header
> Accept: */*                        ← your server receives this header
>                                    ← blank line (end of request headers)
< HTTP/1.1 200 OK                   ← your server sent this line
< Content-Type: text/html           ← your server sent this header
< Content-Length: 418               ← your server computed this from len(file_bytes)
< Connection: close                 ← your server sent this header
<                                    ← blank line (end of response headers)
<!DOCTYPE html>                     ← body begins (your index.html)
...
```

Every `>` line is a string your server received through `conn.recv()`. Every `<` line is a string your server built in `make_response()` and sent through `conn.send()`. There is no magic.

**Test 2: Check status code only:**

```bash
# -s = silent (no progress), -o /dev/null = discard body, -w = write format
curl -s -o /dev/null -w "Status: %{http_code}\nSize: %{size_download} bytes\nTime: %{time_total}s\n" http://localhost:8080/
```

**Exact expected output:**
```
Status: 200
Size: 418
Time: 0.001s
```

**Test 3: Verify 404 status code is correct:**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/nonexistent
```

**Exact expected output:**
```
404
```

**Test 4: Verify JSON Content-Type:**

```bash
curl -v http://localhost:8080/api/status 2>&1 | grep -E "Content-Type|{"
```

**Exact expected output:**
```
< Content-Type: application/json
{"server": "raw-socket-server", "framework": null, "python_socket": true, "status": "running"}
```

The browser treats the same response differently based on `Content-Type: application/json` — it knows to parse the body as JSON rather than render it as HTML. Your `make_response()` function controls this with one string argument.

**Terminal verification — make a request from Python too:**

```python
# In a separate Python shell (not server.py):
import urllib.request
response = urllib.request.urlopen('http://localhost:8080/api/status')
print(response.status)         # 200
print(response.headers)        # All response headers
print(response.read().decode()) # Body
```

`urllib.request` is doing exactly what your `client.py` from Step 1 did — it opens a socket, sends an HTTP request string, and reads the response string.

---

## Quick Check Answers

**1. What are the three components of an HTTP request line, and what separates lines?**
Method, path, and HTTP version — e.g., `GET / HTTP/1.1`. See Step 1's `request` string: `"GET / HTTP/1.1\r\n"`. Lines are separated by `\r\n` (CRLF — carriage return + line feed, ASCII 13 followed by ASCII 10). Using only `\n` is not conformant HTTP, though many servers accept it. The blank line marking the end of headers is `\r\n\r\n` — two CRLFs in a row.

**2. What happens if Content-Length is wrong?**
If `Content-Length` is too short, the client reads only that many bytes and stops — the rest of the body is silently discarded. See Step 2's experiment: setting `Content-Length: 5` caused curl to display only `Hello` from `Hello, World!`. If `Content-Length` is too long, the client reads that many bytes and hangs waiting for the remaining bytes that never arrive — the request times out. `Content-Length` is how the client knows when the body ends without closing the connection.

**3. What happens without Connection: close, and what header fixes it?**
Without `Connection: close`, HTTP/1.1 defaults to keep-alive: the server sends the response but leaves the connection open for another request. Your `recv()` loop in Step 1 blocks indefinitely waiting for more data that never comes. See Step 1's experiment: removing `Connection: close` caused the script to hang. The fix is sending `Connection: close` in the response headers, which tells the client the server is done and it will close the connection. The client's `recv()` then gets an empty read and exits the loop.

**4. What is Flask actually doing at the lowest level?**
Flask calls `socket.socket()`, `bind()`, `listen()`, and `accept()` — exactly what your `server.py` does. It calls `recv()` to read the raw HTTP request string and parses it into a `Request` object (a dictionary of method, path, and headers, built the same way your `parse_request()` works). It calls your route handler function (decorated with `@app.route`). It takes your return value and formats it into an HTTP response string. It calls `send()` to write that string to the socket. See `server.py` Step 5: `ROUTES` is exactly Flask's route table, and `make_response()` is exactly Flask's `Response` class.

---

## Challenge

No solution is provided. Requirements and starter only.

### Static File Server With Content-Type and Path Security

Extend the server to serve any file from a `public/` subdirectory.

**Requirements checklist:**

- [ ] Create a `public/` directory. Put `index.html`, `style.css`, and a small PNG image inside it.
- [ ] `GET /index.html` serves `public/index.html` with `Content-Type: text/html`
- [ ] `GET /style.css` serves `public/style.css` with `Content-Type: text/css`
- [ ] `GET /image.png` serves `public/image.png` with `Content-Type: image/png`
- [ ] `GET /missing.html` returns `404 Not Found`
- [ ] Content-Type is detected from the file extension — use a dictionary mapping extensions to MIME types, not a chain of if/elif
- [ ] `GET /../../../etc/passwd` (or `GET /../../server.py`) returns `403 Forbidden` — the resolved path must be inside the `public/` directory or the request is rejected
- [ ] Test path traversal explicitly: `curl http://localhost:8080/../../server.py` must return 403, not the contents of server.py

**Path traversal prevention** — the core security concept:

```python
import os

PUBLIC_DIR = os.path.join(BASE_DIR, "public")

def safe_file_path(requested_path):
    """
    Returns the absolute path if it is inside PUBLIC_DIR, None otherwise.

    os.path.realpath() resolves all .. and symlinks to the true absolute path.
    If the resolved path does not start with PUBLIC_DIR, it is outside
    the allowed directory — return None to indicate a forbidden request.
    """
    # Strip the leading slash to make it a relative path
    relative = requested_path.lstrip('/')
    # Join with the public directory
    candidate = os.path.join(PUBLIC_DIR, relative)
    # Resolve all .. and symlinks
    resolved = os.path.realpath(candidate)
    # Check that the resolved path is inside PUBLIC_DIR
    if resolved.startswith(os.path.realpath(PUBLIC_DIR)):
        return resolved
    return None  # Path traversal detected
```

**Starter `server.py` skeleton:**

```python
import socket
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

MIME_TYPES = {
    # Fill this in — map file extensions to Content-Type strings
    # e.g., ".html": "text/html"
}

def parse_request(raw_bytes):
    # Same as Step 5
    pass

def make_response(status_code, status_text, content_type, body_bytes):
    # Same as Step 5
    pass

def safe_file_path(requested_path):
    # Implement path traversal prevention here
    pass

def handle_static(path):
    # 1. Call safe_file_path — if None, return 403 Forbidden
    # 2. Check if the file exists — if not, return 404
    # 3. Detect Content-Type from file extension using MIME_TYPES
    # 4. Read the file in binary mode
    # 5. Return make_response(200, "OK", content_type, file_bytes)
    pass

# Server loop
server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_sock.bind(('', 8080))
server_sock.listen(5)

while True:
    conn, addr = server_sock.accept()
    raw_request = conn.recv(4096)
    # Parse, route to handle_static, send response
    pass
```

**When you're done:**
You can serve any file from the `public/` directory with the correct Content-Type header. A browser visiting `/index.html` receives an HTML page, visiting `/style.css` receives CSS that styles the page. Path traversal attempts return 403. You can explain why `os.path.realpath()` is necessary (without it, `../` sequences in the path are not resolved before the prefix check).

**Stuck?** Ask AI: "In Python, how do I safely serve files from a directory and prevent path traversal attacks? What does os.path.realpath() do that os.path.abspath() does not?"
