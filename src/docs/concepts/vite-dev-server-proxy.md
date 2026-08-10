# Concept: Vite Dev Server Proxying (`server.proxy`)

**What you'll understand by the end:** how a dev server can make a
cross-origin API call look same-origin to the browser, without the
backend needing to know anything about it.

**Prerequisites:** `cors-same-origin-policy.md`, `vite-dev-server-config.md`.

## Setup

A Vite-scaffolded frontend project and a separate backend API server
running on a different port (e.g. Flask on `5000`, Vite on `5173`).

## The Problem

`cors-same-origin-policy.md`'s own SE Lens already names the real
alternative to configuring CORS: avoid the cross-origin request entirely,
by making the frontend and backend look like the same origin to the
browser. Running two separate dev servers (one for fast frontend reload,
one for the API) makes them genuinely different origins by default — but
a dev server can sit in between and hide that difference from the
browser's point of view, without touching the backend's own CORS
configuration at all.

## The Isolated Example

Backend (Flask, port `5000`), no CORS configured at all:
```python
from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/api/data")
def data():
    return jsonify({"secret": 42})

app.run(port=5000)
```

`vite.config.ts`, with no proxy:
```typescript
import { defineConfig } from "vite";
export default defineConfig({});
```
A page served by Vite (port `5173`) running `fetch("/api/data")`:
**Real result:** a real network error — `/api/data` resolves relative to
the page's own origin, `http://localhost:5173/api/data`, and nothing is
listening there at all; this never even reaches the CORS check, since
there's no server to respond in the first place.

`vite.config.ts`, with a proxy added:
```typescript
import { defineConfig } from "vite";
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```
The identical `fetch("/api/data")`, no other change:
**Real result:** `{secret: 42}` — succeeds, with zero CORS configuration
on the Flask side at all.

## Mechanical Walkthrough

- `server.proxy` maps a real URL *prefix* (`"/api"`) to a real target
  server (`http://localhost:5000`) — any request Vite's own dev server
  receives whose path starts with that prefix is forwarded there instead
  of being handled by Vite itself.
- The browser only ever talks to Vite's own origin
  (`http://localhost:5173`) — from the browser's point of view,
  `fetch("/api/data")` is a same-origin request, start to finish; the
  same-origin policy (`cors-same-origin-policy.md`) never activates,
  because there genuinely is no cross-origin request from the browser's
  perspective.
- Vite's own dev server, a real Node process, makes the *actual*
  cross-origin request to the real backend on the server side — server-
  to-server HTTP requests are never subject to the same-origin policy at
  all, which is a browser-enforced restriction specifically.
- `changeOrigin: true` rewrites the proxied request's own `Host` header
  to match the real target (`localhost:5000`) instead of leaving it as
  `localhost:5173` — some backends reject or misroute a request whose
  `Host` header doesn't match where it's actually listening; this option
  exists specifically to avoid that class of mismatch.
- This is **development-only** — a real production build serves static,
  pre-built frontend files with no Vite dev server involved at all; a
  production deployment needs its own real answer to this same problem
  (either the two are already served from the same origin, or the
  backend's own real CORS configuration handles it — see
  `cors-same-origin-policy.md`).

## CS Lens

This is a real **reverse proxy** — a server that receives a request on
behalf of another server and forwards it, the response path invisible to
the original client. The same general shape as nginx or a load balancer
sitting in front of several real backend instances, scoped down here to
one dev server forwarding one path prefix to one backend during local
development.

Also recognized in: any API gateway forwarding requests to several
different backend microservices under different path prefixes, and
`ssh -L` local port forwarding (a different transport, the identical
underlying idea of one process transparently relaying traffic to
another).

## SE Lens

**The proxy and CORS solve the identical real problem from two different
layers, and a real project only needs one of them for local development
— but they diverge the moment a real production deployment is
considered.** A production build has no Vite dev server to proxy through
at all; whatever answer a project picks for production (same-origin
static hosting, or real, deliberate CORS configuration on the backend)
has to be decided and configured on its own merits, independent of
whichever one made local development convenient. Relying on the dev
proxy alone and never configuring real CORS would work perfectly in
every developer's own local environment and then fail the first time the
built frontend and backend are ever deployed to genuinely different
origins — exactly the kind of "works on my machine" gap this project's
own real backend avoids by configuring both.

## Connection

Builds on `vite-dev-server-config.md`. Solves the identical real problem
`cors-same-origin-policy.md` names, from the opposite side (hiding the
cross-origin request from the browser, instead of the backend explicitly
permitting it) — a real project's backend commonly configures real CORS
*anyway*, for production, even while local development relies on this
proxy instead.

## Try It Yourself

1. Remove `changeOrigin: true` from a working proxy config and use a
   backend route that specifically checks the incoming `Host` header —
   reproduce a real case where the proxied request behaves differently
   with the option removed.
2. Add a second proxy entry for a different path prefix, targeting a
   different port entirely, and confirm both real backends are reachable
   through the identical Vite origin at once.
3. Open the browser's Network tab while using a proxied `fetch` call and
   inspect the request's own `Origin`/`Host` headers as the browser sees
   them, confirming firsthand that the browser genuinely never sees the
   real backend's actual origin at all.
