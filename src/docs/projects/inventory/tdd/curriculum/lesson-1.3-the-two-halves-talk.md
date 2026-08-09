# Lesson 1.3: The Two Halves, Talking

## What you will build

The connective tissue between Lesson 1.1's backend and Lesson 1.2's
frontend: CORS on the backend, and a dev-server proxy on the frontend —
two different answers to the identical problem (two different origins,
`localhost:5000` and `localhost:5173`, by default unable to talk to each
other from a browser's point of view at all).

## What you need to know first

Nothing project-specific — everything is taught from scratch or cited
from `concepts/`.

## Terms introduced

- **Origin** — the combination of scheme, host, and port
  (`http://localhost:5173`) a browser treats as one identity; two pages
  differing in any one of those three are different origins to it.
- **Same-origin policy** — the browser's default rule that JavaScript on
  one origin cannot read the response of a request made to a different
  origin, even if the request itself succeeds.
- **CORS** (Cross-Origin Resource Sharing) — a server's explicit, opt-in
  permission, sent as a response header, telling the browser it's safe
  to hand a specific other origin the response.
- **Reverse proxy** — a server that forwards a request to a different,
  real backend and returns its response as if it had answered directly
  itself — used here so the browser only ever sees one origin at all.

---

## Concept Unit: Why Two Servers Can't Just Talk

### The Problem

The backend (Lesson 1.1) and the frontend (Lesson 1.2) are both running
right now, on two different ports. A browser loading the frontend and
trying to `fetch` anything from the backend would, by default, have that
response silently withheld — not a network failure, a deliberate browser
restriction neither lesson has addressed yet.

### Concepts reused, 100% match — not re-taught here

- `concepts/cors-same-origin-policy.md` — the restriction itself, and
  the backend's own opt-out mechanism.

### New concept, no match: the dev-server proxy

Full treatment in `concepts/vite-dev-server-proxy.md` — not repeated
here. That file's own isolation lab proves, with a Flask backend and no
CORS configured on it at all, that a `fetch` through Vite's own
`server.proxy` still succeeds — the browser is made to see every request
as same-origin, so the same-origin policy never activates in the first
place.

### Discard the throwaway example

`concepts/vite-dev-server-proxy.md`'s own lab is discarded, per its own
file — its literal `/api/data`/`{secret: 42}` example never appears in
this project.

### Project Change

- **Reference Source** — the original application's `app/__init__.py`
  (the `CORS(...)` call, inside `create_app`); `requirements.txt` (the
  `flask-cors` pin); `vite.config.ts` (the `server` block, in full).
- **Files affected** — Modified: `app/__init__.py`, `requirements.txt`
  (backend); `vite.config.ts` (frontend).
- **Change type** — Add.
- **Location** — `__init__.py`: inside `create_app`, immediately after
  `app = Flask(__name__)`, before the `/health` route. `vite.config.ts`:
  a new top-level `server` field alongside the existing `plugins` field.
- **Dependencies** — Lesson 1.1's own venv (now with `flask-cors`
  installed into it); Lesson 1.2's own npm project.
- **One harmless, currently inert line** — the `'/socket.io'` proxy
  entry has nothing listening on the SocketIO side yet; ported now as
  one atomic part of the original's own `proxy` object rather than
  artificially split across two lessons, and named here explicitly so
  it isn't mistaken for something already working.

### Type this

Update `app/__init__.py` — add the import and the `CORS(...)` call, in
that order, right after `app = Flask(__name__)`:

```python
from flask import Flask
from flask_cors import CORS


def create_app(config_name: str = None) -> Flask:
    app = Flask(__name__)

    CORS(app, resources={r"/*": {"origins": "*"}})

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Manufacturing Platform API is running'}

    return app
```

Update `requirements.txt` — add one line:

```
flask==3.0.0
flask-cors==4.0.0
```

Update `vite.config.ts` — add a `server` field alongside `plugins`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
```

### The Updated Project

Both files' full, current content is shown above.

### Mechanical Walkthrough

- `from flask_cors import CORS` / `CORS(app, resources={r"/*":
  {"origins": "*"}})` — `cors-same-origin-policy.md` covers the browser
  restriction this opts out of; the `CORS` class itself — its real
  constructor, what `resources` accepts, why it's called immediately
  here rather than through the deferred `init_app` pattern
  `flask-extension-deferred-init-app.md` uses for `SQLAlchemy` — is
  covered in `concepts/flask-cors-extension.md`. `r"/*"` applies to
  every route this backend has or will ever have, `"origins": "*"`
  permits any origin — the same broad configuration the original itself
  uses, and the same tradeoff that concept file's own SE Lens already
  names (broad and simple now, a deliberate narrowing to name later if
  this backend ever serves genuinely private data).
- `flask-cors==4.0.0` — reapplies the already-established pinned-version
  convention from Lesson 1.1.
- `server: { port: 5173, open: true, proxy: {...} } }` — direct
  application of `vite-dev-server-proxy.md`'s own proxy mechanism;
  `port`/`open` reapply already-established config the original itself
  sets alongside `proxy` in the same object.
- `'/api': { target: 'http://localhost:5000', changeOrigin: true }` —
  direct application of that same concept file's own `changeOrigin`
  explanation; every request to a path starting `/api` now genuinely
  forwards to the backend.
- `'/socket.io': { target: 'http://localhost:5000', ws: true }` —
  ported now (see Project Change's own stated note) but currently
  inert; `ws: true` (not yet exercised) tells Vite this proxy entry
  should also forward WebSocket upgrade requests, not just ordinary
  HTTP ones — relevant only once the backend actually speaks SocketIO.

### Execution Trace

Both changes are configuration, read once at process startup rather
than executed repeatedly — the trace here is the two different requests
this configuration makes possible, traced separately:

```
Cross-origin request, relying on CORS:
1. A browser page served from a different origin (simulated here with
   `curl -H "Origin: http://localhost:5173"`) sends a GET to
   http://127.0.0.1:5000/health.
2. Flask's own CORS extension inspects the `Origin` header on the way
   in, checks it against `resources={r"/*": {"origins": "*"}}`, and
   finds a match.
3. Flask adds `Access-Control-Allow-Origin: http://localhost:5173` to
   the response before sending it.
4. A real browser (curl doesn't do this part) checks for that header
   before handing the response to the page's own JavaScript. Present →
   the page gets the data. Absent → withheld, per `cors-same-origin-
   policy.md`.

Same-origin request, relying on the proxy:
1. The frontend page, served from http://localhost:5173, calls
   `fetch('/api/...')` — a same-origin request from the browser's own
   point of view, since it never names a different host or port.
2. Vite's dev server receives it, sees the path starts with `/api`,
   and — per this lesson's own `proxy` config — opens its own,
   separate, server-to-server connection to http://localhost:5000 to
   fulfill it.
3. The backend answers that connection exactly as it would answer any
   other request.
4. Vite relays the backend's response back to the browser as its own
   response to the original `fetch`. The browser never made a
   cross-origin request at all, so step 4 above never triggers for
   this path.
```

### CS Lens

Not a new CS idea beyond what this lesson's own two cited concept files
already name (default-deny access control; a reverse proxy). Worth
naming directly: this lesson solves the identical problem twice, from
two different layers (a backend opt-in header vs. frontend-side request
hiding) — see SE Lens, below, for why both are needed and neither alone
is sufficient.

### SE Lens

This project configures both CORS and the dev proxy, deliberately, not
redundantly — `vite-dev-server-proxy.md`'s own SE Lens already names
why: the proxy only exists in development, vanishing entirely the
moment this frontend is actually built and served as static files with
no Vite dev server involved at all. CORS is what a deployed version of
this application will actually depend on; the proxy is what makes
local, two-process development convenient today, before deployment is
this project's concern. Relying on only one of the two would either
break local development immediately (no proxy) or work today and break
the moment this project is genuinely deployed (no CORS) — the "works on
my machine" gap the original application already avoided by configuring
both, ported here for the identical reason.

### Commands needed

```
cd backend
.venv/Scripts/python.exe -m pip install flask-cors==4.0.0
.venv/Scripts/python.exe run.py
```

```
cd frontend
npm run dev
```

### Run it

Captured this session — a cross-origin request against the backend,
with CORS configured:

```
curl -s -i -H "Origin: http://localhost:5173" http://127.0.0.1:5000/health
```

```
HTTP/1.1 200 OK
...
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
...
```

Captured proof the proxy genuinely forwards to the backend — a request
to the frontend dev server's own `/api/*` path, never handled by Vite
itself:

```
curl -s -i http://localhost:5174/api/probe-nonexistent
```

```
HTTP/1.1 404 NOT FOUND
Vary: Origin
server: Werkzeug/3.1.8 Python/3.13.14
...
```

`server: Werkzeug` on that `404` is the backend's own real 404, not
Vite's — the request genuinely reached the Flask process through the
proxy, which has no `/api/*` route registered yet (expected — no
`/api` route exists in this project yet), rather than failing at the
network level or being intercepted by Vite itself.

### Connect

The two halves of this project can now genuinely reach each other — a
deployed frontend can call this backend via CORS; this same backend,
reached through the dev proxy, is exactly how every future `/api/...`
route this project adds will actually get called from local
development.

---

## Connect the pieces

One cross-origin request, traced start to finish: a browser page served
from `http://localhost:5173` calls `fetch('/api/...')`; `vite-dev-
server-proxy.md`'s own mechanism intercepts any path starting `/api`
and forwards it, server-to-server, to `http://localhost:5000` — the
browser never makes a genuinely cross-origin request at all, so `cors-
same-origin-policy.md`'s own restriction never activates for *this*
path. A request made directly against `http://localhost:5000` from a
different origin (this lesson's own `curl -H "Origin: ..."` proof,
standing in for a real browser) instead relies on the `CORS(...)` call
this lesson added — the backend's own explicit permission, checked by
the *browser*, not by curl, which is why curl's own output shows the
header present or absent without ever refusing to show the response
either way.

## What breaks without this

Captured this session by temporarily removing
`CORS(app, resources={r"/*": {"origins": "*"}})` (keeping every other
line unchanged) and restarting the backend:

```
curl -s -i -H "Origin: http://localhost:5173" http://127.0.0.1:5000/health
```

```
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.13.14
Content-Type: application/json
Content-Length: 71
Connection: close

{"message":"Manufacturing Platform API is running","status":"healthy"}
```

A genuine `200`, no `Access-Control-Allow-Origin` header anywhere in it.
`curl`, not being a browser, prints this body regardless; a real
browser's own `fetch()` call would receive this identical response over
the network and then have it withheld from the calling page entirely,
per `cors-same-origin-policy.md`'s own captured error. Restored:

```python
    CORS(app, resources={r"/*": {"origins": "*"}})
```

The identical request, run again, shows the header back:

```
Access-Control-Allow-Origin: http://localhost:5173
```

## Exercises

1. In your own words: why does the proxy remove the *need* for CORS
   during local development, without making the `CORS(...)` call in
   `__init__.py` pointless or redundant?
2. Change `resources={r"/*": {"origins": "*"}}` to name one specific
   origin instead (`{"origins": "http://localhost:5173"}`), restart the
   backend, and confirm a `curl` request with a *different* `Origin`
   header no longer gets the header back — direct proof of `cors-same-
   origin-policy.md`'s own SE Lens warning about `"*"`.
3. Run `node scripts/check-fidelity.mjs diff <commit>` against this
   lesson's commit with no `--allow-new` at all. In your own words: why
   does this commit need zero named exceptions, unlike Lesson 1.2's
   `App.tsx` placeholder?

## Definition of done

- [ ] The backend, run with `CORS(...)` present, returns an `Access-
      Control-Allow-Origin` header on a cross-origin `curl` request.
- [ ] The frontend dev server, queried at `/api/<anything>`, returns a
      `Werkzeug`-served response, not a Vite 404.
- [ ] `concepts/vite-dev-server-proxy.md` exists, was reasoned about for
      real this session, and is referenced by name here rather than
      re-derived.
- [ ] `node scripts/check-fidelity.mjs diff <commit>` exits 0 for this
      lesson's commit, with no exceptions needed.

Stage and commit:

```
git add .
git commit -m "Lesson 1.3: The Two Halves, Talking"
```

This message states *why* the commit exists — the two halves of this
project can now genuinely reach each other, both in local development
and in a future deployment — not merely which files changed.

---

**Next lesson:** Arc 1 of `curriculum/ROADMAP.md` — the first real
database-backed entity, where `check-fidelity.mjs`'s bidirectional
guarantees (no missing, no invented) start mattering for structured data
instead of configuration.
