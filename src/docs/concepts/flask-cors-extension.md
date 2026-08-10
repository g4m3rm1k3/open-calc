# Concept: The `flask_cors.CORS` Extension Object

**What you'll understand by the end:** what the `CORS` class actually
is, its real constructor shape, and what the `resources` argument
configures.

**Prerequisites:** `cors-same-origin-policy.md` (the browser restriction
this object exists to opt out of, from the server's side).

## What it is

`CORS` is a Flask extension class from the third-party `flask-cors`
package — not part of Flask itself. Constructing it against a running
Flask app is what makes that app start sending the
`Access-Control-Allow-Origin` response header `cors-same-origin-
policy.md` already covers.

## Implementation

From `flask_cors`, the public surface this project actually calls:

```python
from flask_cors import CORS

class CORS:
    def __init__(self, app=None, *, resources=None, **kwargs): ...
```

- `app` — the Flask application object to attach to. Passed positionally
  here (`CORS(app, ...)`), immediately, rather than the deferred
  `init_app(app)` pattern `flask-extension-deferred-init-app.md` covers
  for `SQLAlchemy` — `CORS` supports both styles, but this project uses
  the immediate form since nothing about CORS configuration depends on
  values only known later, the way the database connection string does.
- `resources` — a dict describing which routes get which CORS rules.
  Each key is a regular-expression pattern matched against a request
  path; each value is itself a dict of options for routes matching that
  pattern. `{r"/*": {"origins": "*"}}` means: for every path (`/*`
  matches everything), allow every origin (`"origins": "*"`). A real,
  narrower example: `{r"/api/*": {"origins": "https://example.com"}}`
  would apply CORS only to paths starting `/api/`, and only permit
  `https://example.com` specifically.
- `**kwargs` — additional, less commonly needed options (allowed HTTP
  methods, allowed headers, whether credentials are permitted) this
  project doesn't set, so they keep their documented defaults.

## Its use

`CORS(app, resources={r"/*": {"origins": "*"}})` runs once, inside
`create_app`, right after the `Flask` instance is built. From that call
onward, every response this app sends carries the
`Access-Control-Allow-Origin` header `cors-same-origin-policy.md`
already showed is what actually lets a browser hand a cross-origin
response to the calling page's own JavaScript — this object is what
makes that header appear on every real request, without the code for
each individual route needing to add it by hand.

## Try It Yourself

1. Change `resources={r"/*": {"origins": "*"}}` to
   `resources={r"/health": {"origins": "*"}}` (narrowing the pattern to
   one specific path) and confirm a request to a *different*,
   unregistered path no longer receives the CORS header at all.
2. Add a second, real route to a small Flask app with no `resources`
   entry matching it, and confirm cross-origin requests to that specific
   route get no CORS header even while `/health` still does — direct
   proof `resources` is checked per-request, per-pattern, not applied
   globally regardless of what's configured.
