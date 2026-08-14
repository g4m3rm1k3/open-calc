# Concept: HTTP Methods — `GET` vs `POST`

**What you'll understand by the end:** the real distinction between the two most common HTTP methods, and why a server can restrict a route to only one of them.

**Prerequisites:** `http-request-response.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

Not every request means the same thing. Asking a server to *give you* something and asking a server to *do something with data you're sending* are different operations with different implications — a browser might, for example, safely retry the first automatically, but should never silently retry the second.

## The Isolated Example

```python
from flask import Flask, request

app = Flask(__name__)

@app.route("/items", methods=["GET"])
def list_items():
    return {"items": ["a", "b", "c"]}

@app.route("/items", methods=["POST"])
def create_item():
    body = request.get_json(silent=True) or {}
    return {"created": body.get("name", "unnamed")}, 201

with app.test_client() as client:
    print(client.get("/items").get_json())
    print(client.post("/items", json={"name": "widget"}).get_json())
    print(client.post("/items", json={"name": "widget"}).status_code)
    print(client.delete("/items").status_code)
```

**Real output:**
```
{'items': ['a', 'b', 'c']}
{'created': 'widget'}
201
405
```

**What this proves:** the same path, `/items`, answers differently depending on the method used to reach it — `GET` lists, `POST` creates. A method neither route declared (`DELETE`) gets a real `405 Method Not Allowed`, generated entirely by Flask, with no code written for that case.

## Mechanical Walkthrough

- `methods=["GET"]` / `methods=["POST"]` restricts each route to answering only the listed method(s) — a route with no `methods` argument defaults to `GET` only (as every route in the previous lesson did, implicitly).
- `GET` is the method meant for "give me data" — no request body is expected, and a `GET` request is expected to have no side effects (asking for data shouldn't change anything on the server).
- `POST` is the method meant for "here is data, act on it" — a request body is expected, and side effects (creating something, as here) are the normal, expected case.
- A request whose method doesn't match any route registered for that path gets Flask's own built-in `405`, generated the same way an unmatched path gets a `404` — a real HTTP-level failure Flask provides without application code writing it.

## CS Lens

HTTP methods express **intent** as part of the protocol itself, not just as application logic buried in a route's implementation — a request's method alone, before any code runs, already communicates "read" versus "write," which lets infrastructure (browsers, caches, proxies) make real, safe decisions (like "it's fine to automatically retry a failed `GET`, never a `POST`") without knowing anything about what a specific route actually does.

Also recognized in: REST API design broadly (`GET`/`POST`/`PUT`/`DELETE` mapped onto read/create/update/delete operations), and browser behavior itself — refreshing a page that was reached via `GET` is silent and safe; refreshing a page reached via `POST` prompts a "resubmit form?" warning, specifically because the browser knows `POST` implies a side effect.

## SE Lens

Restricting `create_item` to `POST` only (rather than accepting any method and branching on `request.method` inside one handler) makes the *routing table itself* the source of truth for what's allowed at a path, rather than burying that decision inside conditional logic a reader has to trace through. It also gets the free `405` behavior for anything not explicitly allowed — an unrestricted, method-agnostic handler would have to implement that rejection by hand for every case it doesn't intend to support.

## Connection

Builds on `http-request-response.md` and `http-routing-dispatch-table.md`. `fetch-post-with-body.md` is the client-side counterpart — sending a request with the method and body a route like `create_item` expects.

## Try It Yourself

1. Add `methods=["GET", "POST"]` to a single route and branch on `request.method` inside it to handle both cases in one function. Compare this against the two-separate-routes version above — which reads more clearly to you, and why might a real project prefer one over the other as the number of methods grows?
2. Send a `GET` request with a JSON body attached (most HTTP clients allow this even though it's unconventional) to `list_items`. Confirm the body is simply ignored — nothing in `list_items` ever reads `request.get_json()`.
3. Add a `PUT` route for updating an existing item, and a `DELETE` route for removing one. Confirm all four methods on `/items` now route to four different functions, each handling exactly one real operation.
