# Concept: Returning `(body, status_code)` from a Flask Route

**What you'll understand by the end:** the specific syntax Flask recognizes for setting a non-default HTTP status code from a route's return value.

**Prerequisites:** `flask-implicit-dict-to-json.md`, `http-status-codes.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

A route returning just a dict always gets the default `200` status. Sometimes a route needs to report a different outcome — a validation failure, a resource that was just created — using a more specific status code, without abandoning the convenient automatic dict-to-JSON behavior.

## The Isolated Example

```python
from flask import Flask

app = Flask(__name__)

@app.route("/default")
def default():
    return {"message": "no status specified"}

@app.route("/explicit")
def explicit():
    return {"message": "created"}, 201

with app.test_client() as client:
    r1 = client.get("/default")
    r2 = client.get("/explicit")
    print(r1.status_code, r1.get_json())
    print(r2.status_code, r2.get_json())
```

**Real output:**
```
200 {'message': 'no status specified'}
201 {'message': 'created'}
```

**What this proves:** returning a plain dict still defaults to `200`. Returning a two-element tuple — the same dict, plus a number — changes only the status code; the dict is still automatically converted to JSON exactly as before. Nothing about the JSON-conversion behavior was given up to gain the status control.

## Mechanical Walkthrough

- `return {"message": "created"}, 201` — a bare comma at the top level of a `return` statement creates a **tuple** (already-known basic Python, `x, y` without parentheses is still a tuple) — here, a two-element tuple: `({"message": "created"}, 201)`.
- Flask specifically recognizes a route returning a tuple of this shape and interprets the first element as the body (processed exactly as a lone return value would be — dict-to-JSON conversion still applies) and the second as the HTTP status code to use instead of the default `200`.
- A three-element form also exists (`body, status, headers`) for additionally setting custom headers — not needed here, but worth knowing the two-element form isn't the only one Flask recognizes.

## CS Lens

This is a small instance of **API surface overloading based on return shape** — the same `return` statement's meaning (in terms of what Flask does with it) depends on whether the returned value is a bare dict or a tuple containing one. The framework inspects the shape of what it receives and dispatches accordingly, the same general idea as `flask-implicit-dict-to-json.md`'s type-directed behavior, just extended to also read a second tuple element when present.

Also recognized in: any API accepting either a bare value or a value-plus-options tuple/object as a convenience for the common case — a frequent pattern in library and framework design generally.

## SE Lens

The alternative — always constructing a full `Response` object explicitly, even for the common case of "just a dict with a non-default status" — is more verbose for something that happens constantly (nearly every route that validates input needs to return a non-`200` status at least some of the time). The tuple shorthand keeps the common case just as short as returning a bare dict, at the cost of a reader needing to know this specific convention exists — which is exactly why this file exists, to make that convention explicit rather than something noticed only by accident.

## Connection

Builds on `flask-implicit-dict-to-json.md` and `http-status-codes.md`. This is the exact mechanism `input-validation-at-boundary.md`'s `400` response and this file's `201` "created" response both rely on.

## Try It Yourself

1. Return a `(dict, status, headers_dict)` three-element tuple, setting a custom header (e.g. `{"X-Custom-Header": "hello"}`), and confirm the response actually carries it by reading `response.headers["X-Custom-Header"]` from a test client call.
2. Return a tuple where the first element is a plain string instead of a dict (`return "created", 201`). Confirm the status code behavior is identical, and that Flask does *not* attempt dict-to-JSON conversion on a string — only the type-directed behavior from `flask-implicit-dict-to-json.md` applies to the first element, whatever its own type is.
3. Try returning a status code with no body at all as a bare int (`return 204`) — look up what `204 No Content` conventionally means, and confirm Flask accepts this minimal form too.
