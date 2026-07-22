# Concept: Flask's `request` Object

**What you'll understand by the end:** how a route function reads data the client actually sent, rather than only ever returning fixed or computed values.

**Prerequisites:** `http-methods-get-post.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

A route that only ever returns the same fixed data regardless of what was requested (as in the simplest possible routes) is limited. Real endpoints usually need to read something about the specific request currently being handled — its body, its query parameters, its headers.

## The Isolated Example

```python
from flask import Flask, request

app = Flask(__name__)

@app.route("/echo", methods=["POST"])
def echo():
    body = request.get_json(silent=True)
    return {"you_sent": body}

with app.test_client() as client:
    print(client.post("/echo", json={"hello": "world"}).get_json())
    print(client.post("/echo", data="not json", content_type="text/plain").get_json())
```

**Real output:**
```
{'you_sent': {'hello': 'world'}}
{'you_sent': None}
```

**What this proves:** `request` inside `echo()` refers to whichever specific request is currently being handled — the first call's body comes back exactly as sent; the second call, whose body genuinely isn't JSON, produces `None` rather than crashing, because `get_json(silent=True)` was asked to fail quietly instead of raising.

## Mechanical Walkthrough

- `request` is a Flask-provided object, available inside any route function while it runs, representing the current incoming HTTP request — not something imported with actual data already in it; its contents depend entirely on what the client sent for *this* specific call.
- `request.get_json()` reads the request's body and parses it as JSON, returning the equivalent Python value (usually a `dict` or `list`).
- `silent=True` tells `get_json()`: if the body isn't valid JSON at all, return `None` instead of raising an exception — the caller is expected to check for `None` afterward rather than relying on an exception to signal the failure.

## CS Lens

`request` is effectively **request-scoped state** — a value that looks like an ordinary global object from inside route code, but actually refers to different underlying data on every single request, resolved based on which request is currently being processed. (The real mechanism behind this — how Flask makes a seemingly-global name behave per-request — is a separate, deeper concept worth its own treatment once it becomes directly relevant; for now, it's enough to know `request` is always "this specific call's request," never stale data from a previous one.)

Also recognized in: any web framework's equivalent object (Express.js's `req`, Django's `request` parameter passed explicitly into every view function instead of accessed as an implicit global — a real, deliberate design difference between frameworks worth noticing once both are familiar).

## SE Lens

Flask makes `request` available as what looks like a plain import, rather than requiring every route function to declare it as a parameter (as Django does). This trades explicitness (a reader of a Django view immediately sees `request` is an input, just by the function's own signature) for brevity (a Flask route with no need for request data has one less parameter to write) — a real, ongoing design difference between frameworks, not an objectively correct choice either way.

## Connection

Builds on `http-methods-get-post.md`. `input-validation-at-boundary.md` is the very next real step — once `request` has been read, its contents need to be checked before being trusted.

## Try It Yourself

1. Add a second route reading `request.method` directly and returning it in the response — confirm it correctly reports `"POST"` or `"GET"` depending on how the route was reached, for a route registered for both.
2. Read `request.headers` inside a route and return a specific header's value (e.g. `request.headers.get("Content-Type")`). Send requests with different `Content-Type` values and confirm the route sees each one accurately.
3. Read `request.args` (query-string parameters, e.g. `/echo?name=world`) instead of the JSON body, and confirm it's a completely separate source of request data from `get_json()` — both exist on the same `request` object simultaneously.
