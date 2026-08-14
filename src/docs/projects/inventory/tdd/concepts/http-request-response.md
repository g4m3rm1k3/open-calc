# Concept: HTTP Request/Response

**What you'll understand by the end:** the literal text format a browser and a web server exchange underneath any library call (`fetch`, `requests`, etc.) that hides it from you.

**Prerequisites:** `client-server-architecture.md`.

## Setup

Python 3, standard library only (`http.server`) — no installation needed. Any HTTP server would do; this uses one built into Python so the example needs nothing extra installed.

## The Problem

Libraries like `fetch` or Python's `requests` hide the actual bytes going over the network behind a convenient method call. That's usually the right level to work at — but understanding what those bytes actually look like makes every later abstraction (status codes, headers, JSON bodies) concrete instead of magic.

## The Isolated Example

Start a minimal server:
```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"hello from the server")

HTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
```

Then, from a second terminal, send a raw request and look at the literal response. `curl` is a command-line HTTP client — what it is, and what each flag used here and elsewhere in this project does, is covered in full in `concepts/curl-command-line-http-client.md`, not repeated here:
```
curl -v http://127.0.0.1:8000/
```

**Real output:**
```
> GET / HTTP/1.1
> Host: 127.0.0.1:8000
> User-Agent: curl/8.4.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Content-Type: text/plain
< Content-Length: 22
<
hello from the server
```

**What this proves:** underneath every HTTP client library, this is the literal text format on the wire — a method and path on the first line (`GET /`), headers describing the message, a blank line, then the body. Nothing about it is language-specific; it's a plain text protocol either side's HTTP library reads and writes on your behalf.

## Mechanical Walkthrough

- `GET / HTTP/1.1` — the request line: method (`GET`, "give me data" — as opposed to `POST`, "here's data, do something with it"), path (`/`), protocol version.
- `Host: 127.0.0.1:8000` — a required header telling the server which address/port the client thinks it's talking to (relevant when one server answers for multiple domains — not the case here, but the header is always sent).
- The blank line separates headers from body — on the request side, there's no body here since `GET` requests typically don't send one.
- `HTTP/1.1 200 OK` — the response's status line: `200` is the code, `OK` a human-readable label for it. The first digit is the category: `2xx` success, `4xx` the client made a mistake (e.g. `404` not found), `5xx` the server itself failed.
- `Content-Type: text/plain` tells the client how to interpret the body's bytes — `application/json` would mean "parse this as JSON," `text/html` "render this as a page."
- `Content-Length: 22` — the exact byte count of the body that follows, so the client knows where the message ends.

## CS Lens

HTTP is a stateless, text-based **application-layer protocol** — "stateless" meaning each request carries everything the server needs to answer it, with no memory of prior requests built into the protocol itself (sessions/cookies, not covered here, are how state gets layered back on top when needed).

Also recognized in: every REST API, every web page load, and any protocol built as "a fixed message format both sides agree on" — SMTP (email) and FTP follow the same request/response text-line shape.

## SE Lens

HTTP being text-based and human-readable is a deliberate tradeoff. A binary protocol would be more compact and marginally faster to parse, but HTTP's readability is exactly why the `curl -v` output above is legible at all — you can debug it with a browser's network tab or a raw `curl` call, a real, everyday benefit whenever something goes wrong and needs diagnosing.

## Connection

Builds on `client-server-architecture.md` (the shape) by defining the actual message format that shape carries. `http-routing-dispatch-table.md` and `fetch-api.md` both build on this directly — routing decides which code handles a given request line; `fetch` is a client-side API that constructs and sends exactly this kind of message.

## Try It Yourself

1. Change `Content-Type` to `application/json` and the body to `b'{"hello": "world"}'`. Run `curl -v` again — does anything about the client's behavior change, or only what a program reading the response would do differently?
2. Add a second route inside `do_GET` (checking `self.path`) that returns a `404` with a custom body for any path other than `/`. Confirm with `curl -v http://127.0.0.1:8000/nope` that the status line really reads `404`.
3. Try `curl -v -X POST http://127.0.0.1:8000/` against the unmodified server. What status/behavior comes back, and why — hint: `do_GET` is the only method handler defined.
