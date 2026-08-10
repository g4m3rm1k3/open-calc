# Concept: HTTP Routing as a Dispatch Table

**What you'll understand by the end:** what a web framework's `@route(...)`-style decorator is actually doing underneath — a lookup table from a request to the code that should handle it.

**Prerequisites:** `python-decorators.md`, `http-request-response.md`.

## Setup

Python 3, no packages needed — the example below builds routing from scratch, deliberately, to show the mechanism rather than use a framework that hides it.

## The Problem

A server needs to know, for any incoming request path, which piece of code should handle it. A long chain of `if path == "/": ... elif path == "/about": ...` works for a couple of routes and becomes unreadable and error-prone as routes grow — easy to mistype a comparison, easy to forget a branch entirely.

## The Isolated Example

```python
routes = {}

def route(path):
    def register(func):
        routes[path] = func
        return func
    return register

@route("/")
def index():
    return "home page"

@route("/about")
def about():
    return "about page"

def handle_request(path):
    handler = routes.get(path, lambda: "404 not found")
    return handler()

print(handle_request("/"))
print(handle_request("/about"))
print(handle_request("/nope"))
```

**Real output:**
```
home page
about page
404 not found
```

**What this proves:** `@route("/")` didn't run `index()` — it stored it in the `routes` dict under the key `"/"`. `handle_request` is the piece that actually looks a path up and calls whatever it finds there, falling back to a default when nothing matches.

## Mechanical Walkthrough

- `routes = {}` is the table itself — a plain dictionary mapping a path string to a handler function.
- `route(path)` is a decorator *factory* — a function that returns a decorator. Calling `route("/")` first produces a decorator (the inner `register` function), which is then applied to `index`.
- `register(func)` stores `func` in `routes` under the outer `path`, then returns `func` unchanged, so `index` is still callable normally after decoration.
- `handle_request` performs the actual lookup: `routes.get(path, default)` returns the matching handler, or a fallback function if the path was never registered.

## CS Lens

This is the **dispatch table pattern** — turning "which code should run" into a data lookup instead of a branching chain of comparisons. Real routing frameworks build essentially this same table internally (often with more sophisticated matching for path parameters, wildcards, and HTTP methods), just never exposed as a plain dict the way this example is.

Also recognized in: `switch` statements compiled to jump tables, a game engine's input-to-action mapping, and — directly relevant wherever a G-code interpreter dispatches on a numeric code to specific handling logic — the same code-to-behavior lookup shape, whether implemented as a dict or a `switch`.

## SE Lens

The alternative — a growing `if`/`elif` chain — scales poorly: adding a route means finding the right place to insert another branch in a growing list, and a typo in a comparison fails silently (falls through to the wrong branch or none at all) rather than loudly. A dispatch table turns "add a route" into "add a dict entry," and a missing key is a single, uniform failure case (the `.get(...)` fallback) handled once, not re-implemented at every branch.

## Connection

Builds on `python-decorators.md` (the registration mechanism) and `http-request-response.md` (what's actually being dispatched on — a request's method and path). Every real web framework's own routing decorator is this same pattern with more matching sophistication layered on top.

## Try It Yourself

1. Add a third route, `/contact`, and confirm `handle_request("/contact")` returns its handler's result.
2. Extend `route` to also key on HTTP method, not just path — change `routes` to be keyed by `(method, path)` tuples, and `route` to accept both. Register `("GET", "/")` and `("POST", "/")` as two different handlers for the same path and confirm each is reachable independently.
3. Register the same path twice with two different handlers. What happens to the first one? Is silently overwriting a prior registration good behavior for a real router, or should it raise an error — and why might a real framework choose differently than your toy version?
