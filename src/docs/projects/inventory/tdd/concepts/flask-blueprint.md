# Concept: Flask Blueprints

**What you'll understand by the end:** how a real Flask app splits its
routes across multiple files without every one of them needing direct
access to the real `app` object.

**Prerequisites:** `flask-application-and-route-decorator.md`.

## Setup

```
pip install flask
```

## The Problem

`flask-application-and-route-decorator.md`'s own `@app.route(...)`
registers a real route directly on a specific, real `app` object — fine
for one small file, but a real application with dozens of real routes,
naturally grouped (machines, parts, auth, ...), would need every one of
those files to import the *same* real `app` instance just to register a
route on it — a real, awkward, tightly-coupled dependency for a file
that should only need to know about its own routes.

## The Isolated Example

`machines.py`, defined with no real `app` object anywhere in it:
```python
from flask import Blueprint

machines_bp = Blueprint('machines', __name__)


@machines_bp.route('', methods=['GET'])
def list_machines():
    return {'data': []}
```

`__init__.py`, real, separate:
```python
from flask import Flask
from machines import machines_bp

app = Flask(__name__)
app.register_blueprint(machines_bp, url_prefix='/api/machines')
app.run(port=5000)
```

**Real request** (`concepts/curl-command-line-http-client.md` covers
`curl` itself):
```
curl http://127.0.0.1:5000/api/machines
```

**Real output:**
```json
{"data": []}
```

**What this proves:** `machines_bp.route('', ...)` was written with no
real, specific URL prefix and no real `app` object in scope at all —
`/api/machines` only became the real, final URL the moment
`register_blueprint(machines_bp, url_prefix='/api/machines')` combined
the two, in a completely separate file.

## Mechanical Walkthrough

- `Blueprint('machines', __name__)` — creates a real, named collection
  of routes, not yet attached to any real, running application — the
  identical real "create now, bind later" shape
  `flask-extension-deferred-init-app.md` already names for `db`, applied
  here to routes instead of a database extension.
- `@machines_bp.route('', methods=['GET'])` — registers a route on the
  real blueprint object, not on `app` — `''` (empty string) means "the
  blueprint's own root," whatever real prefix it's eventually given.
- `app.register_blueprint(machines_bp, url_prefix='/api/machines')` —
  the real, second step: attaches every real route already registered
  on `machines_bp` to this specific real `app`, with every one of those
  routes' real, final URL prefixed by `/api/machines`.
- A real blueprint file (`machines.py`) never imports `app` at all — it
  only ever needs `Blueprint` itself, making it genuinely reusable
  (registrable under a different prefix, or in a different real app
  entirely, such as a test app) without editing a single line inside it.

## CS Lens

This is a real, direct application of the same **modularity** instinct
behind splitting any large program into independently-understandable
units — here, applied specifically to URL routing: a real blueprint is
a self-contained *unit of routes*, addressable and testable on its own,
combined with others only at real, final assembly time
(`register_blueprint`), the identical shape `http-routing-dispatch-
table.md`'s own dispatch table has, just distributed across several
real, independent tables instead of one single, growing one.

Also recognized in: Django's own "apps" (a near-identical real concept,
different framework), and any plugin/module system where independently-
authored units are only wired together at a real, separate assembly
step, not hardcoded to know about the whole system they'll eventually
be part of.

## SE Lens

**A real blueprint file, importing nothing about the specific app it
will eventually be registered into, is what makes this project's own
real `register_routes` function (registering roughly twenty real
blueprints) possible without every one of those twenty real files
needing to agree on, or even know about, each other.** The real,
concrete payoff: a real route file can be read, tested, and reasoned
about in complete isolation — `machines.py` alone is enough to
understand every real route this project has for machines, with no need
to also read `__init__.py` to know what URLs they'll actually answer at,
only that *some* real prefix will eventually be applied.

## Connection

Builds on `flask-application-and-route-decorator.md`,
`flask-extension-deferred-init-app.md` (the identical real create-then-
attach shape, applied here to routes). This project's own real
`app/routes/__init__.py` registers every real blueprint this project
has, one real `register_blueprint` call per file, all inside one real,
central function.

## Try It Yourself

1. Register the identical real blueprint a second time, under a
   *different* `url_prefix` (`/v2/machines`), and confirm the identical
   real route now answers at both real URLs simultaneously — direct,
   real proof a blueprint's own routes are unaware of, and unaffected
   by, which specific prefix they end up registered under.
2. Add a second route to the same real blueprint
   (`@machines_bp.route('/<string:id>')`) and confirm both real routes
   share the identical real `url_prefix` once registered — reasoning
   about why this is more maintainable than repeating `/api/machines`
   inside every individual real route's own path.
3. Try calling `machines_bp.route(...)` *after* `register_blueprint` has
   already run — read the real, resulting behavior, and reason about
   why route registration on a blueprint is expected to happen before
   it's ever attached to a real app.
