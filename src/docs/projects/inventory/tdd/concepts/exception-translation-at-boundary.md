# Concept: Exception Translation at a Boundary

**What you'll understand by the end:** how to catch an exception raised by one layer of a system and convert it into a different, appropriate signal for the next layer, without either layer needing to know the other's format.

**Prerequisites:** `python-try-except.md`, `layered-architecture-dependency-direction.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

A lower layer (a parsing engine, a data-access module) naturally signals failure in whatever way makes sense for *it* — a raised exception, in Python. A higher layer talking to an external client (an HTTP API, a CLI) needs to signal failure in whatever way makes sense for *that* boundary — an HTTP status code, an exit code. Nothing connects these automatically; something has to catch the first and produce the second.

## The Isolated Example

```python
from flask import Flask

app = Flask(__name__)


class InvalidDataError(Exception):
    pass


def process(value):
    if value < 0:
        raise InvalidDataError(f"{value} must not be negative")
    return value * 2


@app.route("/double/<int:value>")
def double(value):
    try:
        result = process(value)
    except InvalidDataError as error:
        return {"error": str(error)}, 400
    return {"result": result}


with app.test_client() as client:
    print(client.get("/double/5").get_json())
    print(client.get("/double/-3").status_code, client.get("/double/-3").get_json())
```

**Real output:**
```
{'result': 10}
400 {'error': '-3 must not be negative'}
```

**What this proves:** `process()` knows nothing about HTTP — it just raises a plain Python exception. The route function is the only place that knows both "what `InvalidDataError` means" and "what an HTTP client needs to see" — it translates between the two, and neither `process()` nor the HTTP client on the other end needs to know about the other's world.

## Mechanical Walkthrough

- `process(value)` raises `InvalidDataError` — a decision made entirely in terms of the *problem domain* (is this value valid), with no HTTP concept anywhere in it.
- The route function's `try`/`except` is the one place these two different "languages" (Python exceptions, HTTP status codes) meet.
- `except InvalidDataError as error: return {"error": str(error)}, 400` performs the actual translation: an exception's message becomes a JSON field; the fact that *this specific type* was raised becomes the choice of `400` specifically (as opposed to `500`, which unrelated, unexpected exceptions would still produce, uncaught).

## CS Lens

This is **exception translation at a boundary** — converting one layer's native failure signal into whatever the next layer's boundary expects, keeping each layer's code written entirely in its own terms. The code that knows *how to detect* a problem is different from the code that knows *how to report* it externally, and the boundary is exactly where the translation happens.

Also recognized in: any layered system where an internal error type gets mapped to an external-facing one — a database driver's specific error codes translated into a web framework's generic "bad request" response, a CLI tool catching an internal exception and printing a clean message plus a specific exit code instead of a raw stack trace.

## SE Lens

The alternative — having `process()` itself know about HTTP and return a Flask-shaped response directly — would make the core logic unusable from anywhere except a Flask route (a CLI tool wanting the same validation would have nothing to reuse). Keeping `process()` free of HTTP concepts, and doing the translation only at the actual boundary, means the same core logic works underneath any number of different boundaries (a web route, a CLI, a test) without change — directly the same reasoning as `layered-architecture-dependency-direction.md`, applied specifically to how failures cross the boundary, not just how normal results do.

## Connection

Builds on `python-try-except.md` and `layered-architecture-dependency-direction.md`. This is the exact mechanism behind converting a parser's own "this input isn't valid" exception into the `400 Bad Request` an HTTP client actually understands.

## Try It Yourself

1. Add a second custom exception, `NotFoundError`, raised by a different core function, and translate it to `404` in a different route. Confirm both translations coexist cleanly, each route only catching the specific exception relevant to it.
2. Deliberately cause an *unrelated* bug inside `process()` (e.g. reference an undefined variable) instead of raising `InvalidDataError`. Confirm the route's specific `except InvalidDataError` does *not* catch it, and it surfaces as a real `500` — proof that narrow, specific catching (see `python-try-except.md`'s SE Lens) prevents a genuine bug from being mistranslated as "the client's fault."
3. Write a second, non-HTTP "boundary" — a plain function that calls `process()` and prints either the result or a clean, formatted error message to the console, using the identical `InvalidDataError` from the identical `process()` function. Confirm the same core logic serves two completely different boundaries with zero changes to `process()` itself.
