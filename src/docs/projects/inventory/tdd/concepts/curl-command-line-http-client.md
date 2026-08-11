# Concept: `curl` — A Command-Line HTTP Client

**What you'll understand by the end:** what `curl` actually is, what
each of its flags used throughout this project's own lessons controls,
and why a terminal command is the tool of choice for inspecting a raw
HTTP exchange instead of a browser.

**Prerequisites:** none to use the tool itself — `http-request-
response.md` is what makes the raw output this file's own examples
show fully meaningful, but isn't required to run `curl` or follow this
file's own commands.

## Setup

`curl` ships pre-installed on macOS and most Linux distributions, and
on Windows 10/11 (`curl.exe`, bundled with the OS since 2018). Confirm
it's available:
```
curl --version
```

## The Problem

A browser makes an HTTP request every time it loads a page, but it
hides almost everything about that request and response behind a
rendered page — no visible status code, no visible headers, no way to
easily send a request with a custom method or header without extra
tooling. Debugging a server, or simply seeing the literal, raw HTTP
exchange `http-request-response.md` already described, needs a tool
that sends one specific, fully-controlled request and shows exactly
what came back — nothing rendered, nothing hidden.

## The Isolated Example

A minimal server, run in one terminal (real, standard-library Python,
no framework):

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"hello from curl demo")
        else:
            self.send_response(404)
            self.end_headers()

HTTPServer(("127.0.0.1", 8123), Handler).serve_forever()
```

From a second terminal, four real, different `curl` calls against it:

```
curl -s http://127.0.0.1:8123/
curl -s -i http://127.0.0.1:8123/
curl -v http://127.0.0.1:8123/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8123/nope
```

**Real output, captured this session, one block per call above:**
```
hello from curl demo
```
```
HTTP/1.0 200 OK
Server: BaseHTTP/0.6 Python/3.13.14
Date: Mon, 10 Aug 2026 00:20:13 GMT
Content-Type: text/plain

hello from curl demo
```
```
> GET / HTTP/1.1
> Host: 127.0.0.1:8123
> User-Agent: curl/8.17.0
> Accept: */*
>
< HTTP/1.0 200 OK
< Server: BaseHTTP/0.6 Python/3.13.14
< Date: Mon, 10 Aug 2026 00:20:13 GMT
< Content-Type: text/plain
<
hello from curl demo
```
```
404
```

(`-v`'s real output also includes a transfer-progress meter and a
handful of `*`-prefixed connection-status lines — trimmed here since
they don't change between requests and add no teaching value; the
`>`/`<`-prefixed lines shown are the actual request sent and response
received, unedited.)

**What this proves:** the same request, asked four different ways,
reveals four different slices of the identical real exchange — the
body alone, the body with headers, the full raw request *and*
response, and just the numeric status code. Nothing about the server
changed between calls; only what `curl` chose to print did.

## Mechanical Walkthrough

- `curl <url>` (no flags) — sends a `GET` request (the default method)
  to the given URL and prints only the response body to standard
  output. This is `curl` at its simplest — closest to "what would a
  browser eventually render," minus the rendering.
- `-s` (`--silent`) — suppresses `curl`'s own progress meter (the
  `% Total % Received...` transfer-speed display it normally prints to
  the terminal). Used throughout this project's own lessons specifically
  so captured output stays limited to the actual HTTP exchange, not
  `curl`'s own unrelated status noise.
- `-i` (`--include`) — prints the response's status line and headers
  *before* the body, exactly as the server sent them, in addition to
  the body `curl <url>` alone already shows.
- `-v` (`--verbose`) — the most complete view: every line curl actually
  sent (prefixed `>`) and every line it received back (prefixed `<`),
  the real raw HTTP text `http-request-response.md` already described.
  This is the flag to reach for when a request isn't behaving as
  expected and the exact bytes matter, not just the final result.
- `-o <file>` (`--output`) — writes the response body to `<file>`
  instead of printing it. `-o /dev/null` (a special file on macOS/Linux
  that discards anything written to it — `NUL` is the Windows
  equivalent) is a common idiom for "I don't care about the body at
  all, only what `-w` prints below."
- `-w "<format>"` (`--write-out`) — after the transfer completes,
  prints a string built from real, live values `curl` tracked during
  the request. `%{http_code}` is one of many available fields — the
  numeric status code and nothing else. Combined with `-o /dev/null`,
  this is how this project checks *only* a status code without any
  body text cluttering the output.
- `-X <method>` (`--request`) — used elsewhere in this project
  (`curl -X POST ...`) to send a method other than the default `GET` —
  `http-methods-get-post.md` covers what `POST` itself means; `-X` is
  simply how `curl` lets you choose it.
- `-H "<header>: <value>"` (`--header`) — adds a custom request header.
  This project uses it to send `Origin: http://localhost:5173` by hand
  (`cors-same-origin-policy.md`), simulating what a real browser would
  send automatically on a cross-origin request, since `curl` itself
  doesn't enforce or send that header on its own.
- `-F "<field>=<value>"` (`--form`) — builds and sends a real
  `multipart/form-data` request, the same wire format a browser sends
  when submitting a file input (`browser-formdata-file-upload.md`).
  `-F "file=@Untitled.TOOLDB"` — the leading `@` is significant: it
  tells `curl` the value is a *path to a real file on disk*, whose
  contents should be read and attached, rather than the literal string
  `"@Untitled.TOOLDB"` itself.

## CS Lens

`curl` is a real, general-purpose **HTTP client library exposed as a
command-line tool** — the same underlying transfer engine (`libcurl`)
is embedded in an enormous range of real software (PHP's own `curl`
extension, git's own HTTPS support, countless mobile apps) — `curl` the
command is a thin, direct wrapper around it for interactive/scripted
use.

Also recognized in: `wget` (a similar but download-focused command-line
tool), a browser's own Network tab (the same raw request/response data,
shown graphically instead of as text), and Postman/Insomnia (GUI tools
built around the identical idea of crafting one specific HTTP request
and inspecting its raw response).

## SE Lens

**Why a terminal tool instead of always using a browser?** A browser
adds real, useful behavior on top of a raw request — it automatically
sends cookies, follows redirects, renders HTML, and enforces the
same-origin policy (`cors-same-origin-policy.md`) — all genuinely
helpful for browsing, and all genuinely in the way when the actual goal
is seeing or controlling the raw exchange itself. `curl` sends
*exactly* the request you specify and shows *exactly* what came back,
no automatic behavior layered on top unless explicitly requested with a
flag — the correct tool specifically because it does less, not more,
than a browser.

## Connection

Builds on `http-request-response.md` (the raw message format `curl`
sends and displays) and `http-status-codes.md` (what the numbers `-w
"%{http_code}"` prints actually mean). Used throughout this project
from Lesson 1.1 onward as the standard way to verify a real server's
behavior without needing a browser open.

## Try It Yourself

1. Run `curl -s -i http://127.0.0.1:8123/nope` against the isolated
   example above (`/nope` is never registered) and confirm the status
   line reads `404`, with no body — direct proof `-i` shows headers
   for an error response exactly as readily as a successful one.
2. Run `curl -X POST http://127.0.0.1:8123/` against the same server
   (which only defines `do_GET`, not `do_POST`) and read the real
   status code that comes back — connect it to `http-methods-get-
   post.md`'s own explanation of what a server does with a method it
   never defined a handler for.
3. Compare `curl -s <url>` and `curl -s -i <url>` against the same
   real request side by side. State, in one sentence, exactly what
   `-i` added — not what it "shows more of," the precise lines.
