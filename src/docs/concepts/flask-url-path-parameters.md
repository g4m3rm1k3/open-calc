# Concept: Flask URL Path Parameters

**What you'll understand by the end:** how to build a route that accepts part of its own URL as a real, usable input value, rather than only reading data from a query string or request body.

**Prerequisites:** `http-routing-dispatch-table.md`.

## Setup

Python 3 with Flask installed:
```
pip install flask
```

## The Problem

Some resources are naturally identified directly in the URL path itself — `/api/tools/drill_hss` reads more clearly, and is more conventional real-world REST design, than `/api/tools?name=drill_hss`. A route needs a way to capture that variable path segment and receive it as a real, usable argument, rather than only ever matching one exact, fixed path.

## The Isolated Example

```python
from flask import Flask

app = Flask(__name__)

@app.route("/greet/<name>")
def greet(name):
    return {"message": f"Hello, {name}!"}

with app.test_client() as client:
    print(client.get("/greet/Alex").get_json())
    print(client.get("/greet/Sam").get_json())
```

**Real output:**
```
{'message': 'Hello, Alex!'}
{'message': 'Hello, Sam!'}
```

**What this proves:** one single route definition (`"/greet/<name>"`) matched two different real URLs, and in each case, the matching segment (`Alex`, `Sam`) was handed directly to `greet` as a real argument — no manual parsing of the URL path was written anywhere.

## Mechanical Walkthrough

- `<name>` inside a route string is a **URL path parameter**: it matches any single path segment (any text with no `/` in it) in that position, and its matched value is passed as a keyword argument to the view function, using the exact same name.
- The view function's parameter name must match the `<name>` placeholder exactly — `def greet(name):` receives the captured segment because both are spelled `name`.
- Flask supports typed converters (`<int:tool_id>` matches only digits and converts the match to a real Python `int` before calling the view function; `<name>` with no type prefix defaults to matching any string with no `/`) — using `<int:...>` where appropriate lets Flask reject a non-numeric path segment automatically, before the view function ever runs.
- A route can combine multiple path parameters (`/api/tools/<category>/<name>`) and mix them with query-string parameters (read separately, via `request.args`) — the two are independent mechanisms for getting data into a route.

## CS Lens

This is **URL-based routing with pattern capture** — extending the basic dispatch-table idea (`http-routing-dispatch-table.md`: exact path strings mapped to handler functions) to match a *family* of related paths with one rule, extracting the varying portion as real data rather than requiring a separate, hardcoded route registered for every possible value.

Also recognized in: every other real web framework's equivalent mechanism (Express.js's `/users/:id`, Django's URL converters, Ruby on Rails' route parameters) — the identical underlying need, addressed with near-identical syntax across frameworks, because REST-style "the resource's identifier lives in the path" URL design is close to universal in modern web APIs.

## SE Lens

Using a URL path parameter for a resource's own identifier (`/api/tools/drill_hss`) rather than a query parameter (`/api/tools?name=drill_hss`) is more than a style preference — it communicates, via the URL's own structure, that `drill_hss` identifies *which* resource is being addressed (following REST convention: a path segment identifies a specific resource; a query string typically modifies or filters a request to a resource). This distinction also matters for HTTP caching — many caching layers key on the full path, treating `/api/tools/drill_hss` as a cacheable, distinct resource in a way that's less consistent across different query-string-based URLs referring to conceptually the same thing.

## Connection

Builds on `http-routing-dispatch-table.md`. Commonly paired with `http-status-codes.md`'s `404` — the natural response when a path parameter's value doesn't correspond to any real, existing resource.

## Try It Yourself

1. Add a second route using `<int:count>` (`@app.route("/repeat/<int:count>")`) and confirm requesting `/repeat/abc` (non-numeric) produces a real `404` automatically — Flask's own converter rejecting a non-matching segment before the view function is ever called, distinct from a `404` your own code deliberately returns for "valid format, but not found."
2. Add a second path parameter to `greet` (`/greet/<name>/<int:times>`) and repeat the greeting that many times in the response — confirming multiple path parameters combine naturally in one route.
3. Compare reading the same logical value two ways — as a path parameter (`/greet/<name>`) versus as a query parameter (`/greet?name=Alex`, read via `request.args.get("name")`) — and write down, in your own words, when each is the more appropriate real design choice for a route you might build.
