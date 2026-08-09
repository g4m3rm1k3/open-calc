# Concept: `Flask.run(...)`

**What you'll understand by the end:** what `app.run()` actually starts,
what its `port` argument controls, and why it's explicitly a
development-only tool.

**Prerequisites:** `flask-application-and-route-decorator.md` (what
`app` is); `network-port.md` (what a port is).

## What it is

`run()` is a method on the `Flask` application object that starts
Flask's own built-in development web server and makes it start
listening for real HTTP connections.

## Implementation

From Flask's own public surface:

```python
class Flask:
    def run(self, host=None, port=None, debug=None, **options) -> None: ...
```

- `host` — which network interface to listen on. Left unset here,
  which defaults to `127.0.0.1` — `localhost-loopback-address.md`'s own
  concept: reachable only from this machine.
- `port` — which port number to bind (`network-port.md`). Left unset,
  Flask defaults to `5000`; this project passes it explicitly
  (`port=5000`) so the exact port is stated in the source rather than
  left to a default a reader would have to already know.
- `debug` — not passed here; when `True`, enables Flask's interactive
  debugger and auto-reload on code changes — real, useful in
  development, and a real security risk if ever left on in a public
  deployment (`dev-server-debug-mode-risk.md`).
- The call **blocks**: control does not return to whatever called
  `run()` until the server is stopped (Ctrl+C, or a crash) — this is
  why it's always the last real line in a script.

## Its use

`app.run(port=5000)` is the line that actually turns the built `app`
object from Lesson 1.1 into something a browser or `curl` can reach —
everything before it (`create_app()`, route registration) only
*prepares* the app; nothing is listening on any real network socket
until this call runs.

## Try It Yourself

1. Call `app.run(port=5000)` twice in a row in the same script (the
   second call is unreachable code, since the first one blocks — but
   temporarily move the two `run()` calls into two *separate* terminals
   instead, both targeting port `5000`) and read the real
   `OSError: [Errno 48] Address already in use` this produces —
   `network-port.md`'s own already-proven behavior, now hit directly.
2. Call `app.run(port=5000, debug=True)` and deliberately introduce a
   syntax-adjacent runtime error (raise an exception inside a route) —
   compare the response you get to what this project's own code
   produces with `debug` left unset.
