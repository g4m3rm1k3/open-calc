# Concept: Input Validation at a Boundary

**What you'll understand by the end:** why checking untrusted data's shape immediately at the point it enters your code is worth the extra lines, and what "boundary" means precisely.

**Prerequisites:** `flask-request-object.md`, `python-isinstance.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

Data arriving from outside a program — a network request, user input, a file — could be anything: the right shape, a completely different shape, or missing entirely. Code written assuming it's always well-formed will crash, unhelpfully, the moment reality disagrees.

## The Isolated Example

```python
from flask import Flask, request

app = Flask(__name__)

@app.route("/greet", methods=["POST"])
def greet():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "name" not in body:
        return {"error": 'expected a JSON body like {"name": "Ada"}'}, 400
    return {"greeting": f"Hello, {body['name']}!"}

with app.test_client() as client:
    print(client.post("/greet", json={"name": "Ada"}).get_json())
    print(client.post("/greet", json={}).status_code)
    print(client.post("/greet", json=["not", "a", "dict"]).status_code)
    print(client.post("/greet", data="not json", content_type="text/plain").status_code)
```

**Real output:**
```
{'greeting': 'Hello, Ada!'}
400
400
400
```

**What this proves:** three genuinely different kinds of malformed input — a valid but incomplete object, a validly-JSON value of the wrong shape, and text that isn't JSON at all — all land on the exact same check and produce the exact same clear `400` response, rather than three different, confusing crashes each requiring separate handling.

## Mechanical Walkthrough

- `body = request.get_json(silent=True)` may be `None` (not valid JSON), a `dict`, a `list`, a string, a number, or a boolean — JSON permits several top-level shapes, not just objects.
- `not isinstance(body, dict)` rejects everything except a real dict — a `list`, a bare string, and `None` (returned on invalid JSON) are all caught by this one check.
- `or "name" not in body` — only reached if `body` genuinely is a dict — additionally requires the one specific key this route needs.
- Only past this check can the rest of the function safely assume `body["name"]` exists and behaves like a value the code can use — everything before the check must consider `body` untrustworthy in every respect.

## CS Lens

This is **input validation at a trust boundary** — the specific point where data crosses from "anything the outside world could possibly send" into code that assumes a particular structure. Validating right at that crossing point means everything downstream can be written as if the data were always well-formed, without re-checking the same assumption repeatedly deeper in the code.

Also recognized in: literally every real API endpoint that exists, a compiler's front end rejecting malformed source before real analysis begins, and any system accepting data from a file, a network, or a user — the boundary moves, but the principle (validate once, at the crossing) doesn't.

## SE Lens

The alternative — skip validation, use `body["name"]` directly — works for every well-formed request and crashes with a raw, unhelpful `TypeError` or `KeyError` the moment anything malformed arrives (visible to a real client as an opaque `500` error, not something they can act on). A validation check trades a small amount of upfront code for turning an opaque crash into a specific, actionable response the caller can actually understand and fix. Writing this check at the very first endpoint a project builds — rather than deferring it — means there's no backlog of unvalidated routes to retrofit once the project has many of them.

## Connection

Builds on `flask-request-object.md` and `python-isinstance.md`. Directly followed by `flask-tuple-status-code-response.md` — the mechanism for actually returning the `400` this check decides to return.

## Try It Yourself

1. Add a second required field (`"language"`) to the validation check, and confirm a request with `"name"` but no `"language"` is correctly rejected.
2. Add a check that `body["name"]` specifically is a non-empty string (not just present) — `isinstance(body.get("name"), str) and body["name"].strip()`. Test with `{"name": ""}` and `{"name": 42}` and confirm both are now rejected too.
3. Remove the validation check entirely and send the same three malformed requests from the example. Read the real, raw errors Flask now produces for each — compare how much less useful they are to a real client than the single, clear `400` message the validated version produced.
