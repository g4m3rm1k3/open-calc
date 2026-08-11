# Concept: WSGI — The Web Server Gateway Interface

**What you'll understand by the end:** what problem a web framework
like Flask actually solves that raw HTTP handling doesn't, what WSGI
is, and why Flask's own development server warns you, unprompted, to
"use a production WSGI server instead."

**Prerequisites:** `client-server-architecture.md`, `http-request-
response.md`, `http-routing-dispatch-table.md`.

## Setup

Python 3, standard library only (`http.server`, `wsgiref`) — no
installation needed.

## The Problem

`http-request-response.md` already showed the raw shape of an HTTP
message using Python's built-in `http.server`. Writing a real
application directly against that module means hand-rolling everything
yourself for every single route: parsing the path out of `self.path`,
checking the method by hand, building the response status line,
setting `Content-Length` correctly, encoding the body to bytes,
deciding what counts as a 404. None of that logic is specific to *your*
application — every Python web app needs the identical plumbing, which
means every project either reinvents it or depends on someone else
having already solved it once, well, in a reusable way.

That's what a **web framework** is: a library that solves the request-
parsing/response-building plumbing once, so your own code only has to
answer one narrower question — "given this specific request, what
should the response be?" But for a framework's solution to be reusable
across *many different real web servers* (not just Python's own basic
built-in one), Python needed a standard, agreed-upon way for any web
server to hand a request to any web application, regardless of which
framework built that application. That agreement is WSGI.

## The Isolated Example

A WSGI application is nothing more than a callable following one
specific, minimal contract — demonstrated here with no framework at
all, using Python's own standard-library WSGI server:

```python
from wsgiref.simple_server import make_server

def application(environ, start_response):
    # environ: a real dict describing the incoming request.
    # start_response: a real function this app must call to set the
    # status line and headers, before returning the body.
    path = environ["PATH_INFO"]
    if path == "/":
        start_response("200 OK", [("Content-Type", "text/plain")])
        return [b"hello from a raw WSGI app"]
    start_response("404 NOT FOUND", [("Content-Type", "text/plain")])
    return [b"not found"]

with make_server("127.0.0.1", 8001, application) as server:
    print("listening on port 8001")
    server.serve_forever()
```

Then, from a second terminal (`concepts/curl-command-line-http-client.md`
covers `curl` and the `-i` flag used here):
```
curl -i http://127.0.0.1:8001/
curl -i http://127.0.0.1:8001/nope
```

**Real output, captured this session:**
```
HTTP/1.0 200 OK
Date: Sun, 09 Aug 2026 22:21:48 GMT
Server: WSGIServer/0.2 CPython/3.13.14
Content-Type: text/plain
Content-Length: 25

hello from a raw WSGI app
```
```
HTTP/1.0 404 NOT FOUND
Date: Sun, 09 Aug 2026 22:21:48 GMT
Server: WSGIServer/0.2 CPython/3.13.14
Content-Type: text/plain
Content-Length: 9

not found
```

**What this proves:** `application` is an ordinary Python function —
no Flask, no `@app.route`, nothing installed beyond the standard
library — and `wsgiref`'s own server successfully served real HTTP
requests through it. Any web server that speaks WSGI can run this exact
function unmodified; nothing about `application`'s own code needs to
know or care which specific server is running it. Notice
`Content-Length: 25` appears even though `application` never set it —
`wsgiref`'s own server measured the returned bytes and added that
header itself, on the application's behalf, one small real example of
what a WSGI *server* handles so the *application* doesn't have to.

## Mechanical Walkthrough

- `def application(environ, start_response):` — the entire WSGI
  contract: a callable taking exactly these two arguments, in this
  order. This is the interface every Python web framework — Flask,
  Django, FastAPI (with an ASGI variant for async) — ultimately
  produces underneath its own nicer API; `@app.route(...)` is Flask
  building and registering functions that eventually get combined into
  one object satisfying this exact same contract.
- `environ` — a real dict the server builds from the actual incoming
  request (`PATH_INFO`, `REQUEST_METHOD`, headers, and more) — the WSGI
  server's job is translating the raw bytes `http-request-response.md`
  showed into this structured dict, once, so every application built on
  top doesn't have to re-parse raw HTTP text itself.
- `start_response(status_line, headers)` — a function the *server*
  hands to the application; calling it is how the application declares
  its response's status and headers, separately from returning the
  body.
- `return [b"..."]` — the response body, as an iterable of byte
  strings — a list here, though WSGI permits any iterable, which is
  part of what lets a real application stream a large response
  incrementally instead of building the whole thing in memory first.
- `make_server("127.0.0.1", 8001, application)` — `wsgiref`'s own
  built-in WSGI server, given the `application` callable to run
  requests through. This is a real WSGI server, exactly as much as
  Flask's own dev server or a production one like Gunicorn — the only
  differences between them are performance, concurrency handling, and
  production-readiness, not the interface itself.

## Execution Trace

One real request, traced through the WSGI boundary specifically:

1. curl sends a real HTTP GET request for "/" to 127.0.0.1:8001.
2. wsgiref's server receives the raw bytes and parses them (the same
   real parsing http-request-response.md's own raw example needed,
   done here by the server instead of by hand).
3. The server builds `environ`, populating PATH_INFO="/" and other
   keys from the parsed request.
4. The server calls application(environ, start_response) — handing
   control to application code that has never seen a raw socket or a
   line of HTTP text directly.
5. Inside application: path == "/" is true. start_response("200 OK",
   [("Content-Type", "text/plain")]) is called — the server records
   this status/headers, but nothing is sent to the client yet.
6. application returns [b"hello from a raw WSGI app"].
7. The server takes that returned body, combines it with the status/
   headers start_response recorded, and writes the real HTTP response
   back onto the socket connected to curl.
8. curl receives and prints it.

## CS Lens

WSGI is a **standardized interface** (a contract, agreed on in advance,
that multiple independently-written implementations can satisfy) —
distinct from the adapter pattern (`concepts/adapter-pattern.md`),
which converts one *already-existing, mismatched* interface into
another after the fact. WSGI isn't adapting anything to anything; it's
the shared contract itself, designed up front so a server and a
framework never need adapting to each other in the first place. Neither
Gunicorn nor Flask needs to know anything about the other's actual
code — both only need to agree on the shape of
`application(environ, start_response)`.

Also recognized in: JDBC (Java's standard interface between application
code and any specific database driver), ODBC before it, any plugin
system where a host program defines a contract and lets independently-
written pieces satisfy it without the host needing their source code.

## SE Lens

**Why does this matter for Flask specifically?** Flask's own `app.run()`
starts a real, genuine WSGI server — but a deliberately simple,
single-threaded (by default) one, meant for one developer's own machine
during development, not for handling many real users' simultaneous
requests reliably. This is exactly why Flask prints, unprompted, every
time: *"WARNING: This is a development server. Do not use it in a
production deployment. Use a production WSGI server instead."*
(`dev-server-debug-mode-risk.md` already showed this exact warning.) A
real deployment instead runs the identical Flask application object
through a separate, production-grade WSGI server (Gunicorn, uWSGI,
Waitress) — possible *at all*, with zero changes to the application's
own code, only because both the dev server and the production server
agree on the same WSGI contract this file just demonstrated directly.
Swapping the server without touching the application is the entire
point of standardizing this interface in the first place.

## Connection

Builds on `client-server-architecture.md` (the wait-then-react shape),
`http-request-response.md` (the raw message WSGI's `environ` gets built
from), and `http-routing-dispatch-table.md` (what a framework does
*inside* its own WSGI-callable to decide which of your functions
actually runs). This project's own `Flask(__name__)` object — first
built in Lesson 1.1 — is itself a real WSGI application under the
hood; `app.run(port=5000)` is Flask handing that object to its own
built-in, development-only WSGI server, the same relationship this
file's own `make_server(..., application)` call demonstrates directly.

## Try It Yourself

1. Add a second real route to the isolated example (`/about`, returning
   a different body) and confirm both are reachable — you're now doing,
   by hand, exactly what `http-routing-dispatch-table.md` already
   showed a framework automates.
2. Change `start_response`'s status to `"500 INTERNAL SERVER ERROR"` for
   the `/` path and confirm `curl -i` shows that exact status line —
   direct proof nothing about the status code is decided by the server
   itself; the application fully controls it via `start_response`.
3. Look up Gunicorn's own real startup command
   (`gunicorn myapp:app`) and identify, in your own words, which part
   of that command names the WSGI-callable object being handed to it —
   the same role `application` plays in this file's own example.
