# Concept: HTTP Status Codes

**What you'll understand by the end:** what the different categories of HTTP status code mean, and specifically the distinction between `400`, `404`, and `500`.

**Prerequisites:** `http-request-response.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

A client needs a reliable, machine-readable way to know whether a request succeeded, and if not, roughly *why* — without having to parse a human-readable error message to figure out whether the problem was on their end or the server's.

## The Isolated Example

```python
from flask import Flask

app = Flask(__name__)

@app.route("/ok")
def ok():
    return {"status": "fine"}

@app.route("/bad-request")
def bad_request():
    return {"error": "you sent something wrong"}, 400

@app.route("/server-error")
def server_error():
    raise ValueError("something broke internally")

@app.route("/create", methods=["POST"])
def create():
    return {"id": 1, "created": True}, 201

with app.test_client() as client:
    print(client.get("/ok").status_code)
    print(client.get("/bad-request").status_code)
    print(client.get("/nonexistent-path").status_code)
    print(client.get("/server-error").status_code)
    print(client.post("/create").status_code)
```

**Real output:**
```
200
400
404
500
201
```

**What this proves:** five different real outcomes produce five different, specific status codes — a normal success, a route deliberately reporting bad input, a path that doesn't exist at all, an unhandled exception, and a route that just created something new — each one distinguishable by the client without reading any response body.

## Mechanical Walkthrough

- `200 OK` — the default status for a route that returns normally, meaning success.
- `400 Bad Request` — explicitly returned when a route decides *this specific request*, as sent, cannot be fulfilled because of something wrong with what the client sent.
- `404 Not Found` — generated automatically by Flask when no registered route matches the requested path at all — no application code decided this; it's the framework's own default behavior for "nothing lives here."
- `500 Internal Server Error` — generated automatically when a route raises an exception that nothing catches — the server's own code failed, as opposed to the client having sent something wrong.
- `201 Created` — explicitly returned when a request has succeeded *and* resulted in a genuinely new resource coming into existence — a more specific, more informative success code than a plain `200`, telling the client not just "this worked" but "something new now exists because of it," conventionally paired with a response body describing the newly-created resource (often including its assigned id).

## CS Lens

The first digit of a status code names its **category**: `2xx` success, `3xx` redirection (not shown here), `4xx` the client's request was the problem, `5xx` the server's own handling was the problem. This coarse categorization lets generic tooling (browsers, monitoring systems, retry logic) make broadly correct decisions — "a `5xx` might be worth retrying, a `4xx` almost certainly won't succeed by retrying identically" — without understanding what any specific endpoint does.

Also recognized in: any layered signaling system using a small set of category codes to convey a lot of information compactly — exit codes in Unix processes (`0` success, nonzero categories of failure) follow the same coarse-then-fine structuring idea.

## SE Lens

Distinguishing `400` from `500` specifically matters because they imply different responsibilities: a `400` tells a client "fix what you sent," a `500` tells them "this isn't something you did, and retrying identically won't help." Returning `200` for every outcome (with an `"error"` field buried in an otherwise-normal-looking JSON body, a real anti-pattern) forces every client to inspect the body just to know if something went wrong at all — throwing away information the HTTP layer itself already exists to carry.

## Connection

Builds on `http-request-response.md`. `flask-tuple-status-code-response.md` is the specific Flask mechanism used above to set a non-default status code from a route's return value. `input-validation-at-boundary.md` is the most common real reason a route deliberately chooses to return `400`.

## Try It Yourself

1. Add a route that returns `{"error": "not found"}, 404` explicitly (application code choosing this status, as opposed to Flask's automatic `404` for an unmatched path). Confirm both produce the same status code, even though only one involved a route actually running.
2. Add a `try`/`except` around the code in `server_error` that catches the `ValueError` and returns `{"error": str(e)}, 500` explicitly instead of letting it propagate. Compare the response body between the caught and uncaught versions — what extra information does the uncaught version's response carry in debug mode that the deliberately-returned version doesn't?
3. Look up `401 Unauthorized` and `403 Forbidden` — two more `4xx` codes representing genuinely different situations (not authenticated at all, versus authenticated but not permitted) — and write two routes demonstrating the distinction, even without real authentication behind them yet.
4. Change `/create` to return a plain `200` instead of `201` for the identical "something new was created" outcome, and reason about what real, machine-readable information a generic client (or automated tooling) loses when a creation endpoint doesn't distinguish itself from an ordinary read.
