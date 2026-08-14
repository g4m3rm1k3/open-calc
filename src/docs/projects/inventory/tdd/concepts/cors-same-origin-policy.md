# Concept: The Same-Origin Policy and CORS

**What you'll understand by the end:** why a browser blocks JavaScript on one site from reading a response from another, what exactly counts as "the same" site, and how a server explicitly opts back in.

**Prerequisites:** `http-request-response.md`, `fetch-api.md`.

## Setup

Two real HTTP servers on different ports on the same machine — e.g. one built with Flask (`pip install flask`) on port 5000, one static file served any way (even `python -m http.server 5180`) on port 5180 — and a browser to load one and fetch from the other.

## The Problem

A browser routinely has many sites open, or cached credentials/cookies for many sites, at once. Without a restriction, a malicious page could run JavaScript that silently `fetch`es a response from a completely different site the user happens to be logged into — a bank, a mail provider — and read the result, entirely invisibly to the user. Something has to stop a script on one site from freely reading responses from another, by default.

## The Isolated Example

Server A (Flask, port 5000), with no special configuration:
```python
from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/api/data")
def data():
    return jsonify({"secret": 42})

app.run(port=5000)
```

Server B (any static host, port 5180) serving a page whose script runs:
```javascript
fetch("http://127.0.0.1:5000/api/data")
    .then((r) => r.json())
    .then((data) => console.log(data));
```

**Real browser console output, loading Server B's page:**
```
Access to fetch at 'http://127.0.0.1:5000/api/data' from origin
'http://localhost:5180' has been blocked by CORS policy: Response to
preflight request doesn't pass access control check: No
'Access-Control-Allow-Origin' header is present on the requested resource.
```

Adding one line to Server A:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app, origins=["http://localhost:5180"])
```

**Real output after restart:** the identical `fetch` call now succeeds; `console.log` prints `{secret: 42}`.

**What this proves:** the request itself reached the server both times — this isn't a network failure. The *browser* withheld the response from the page's JavaScript until the server explicitly said, via a response header, that `http://localhost:5180` specifically is allowed to read it.

## Mechanical Walkthrough

- An **origin** is the exact combination of scheme + host + port (`http://localhost:5180` and `http://127.0.0.1:5000` are two different origins — differing in host *and* port, either difference alone would be enough).
- By default, a browser enforces the **same-origin policy**: a page's JavaScript may only freely read responses from its own origin.
- **CORS** (Cross-Origin Resource Sharing) is the mechanism a server uses to opt out of that default restriction for specific other origins, via response headers — `Access-Control-Allow-Origin: http://localhost:5180` tells the browser "responses from me may be read by scripts running on that specific origin."
- The request itself is not blocked (the server receives it and can respond, as the error message's mention of a "preflight request" already having happened shows) — it's the browser withholding the *response* from the requesting page's JavaScript that CORS governs.

## CS Lens

CORS is an application of **default-deny**: nothing is permitted unless something specifically allows it, enforced at the browser/network boundary rather than trusted to any individual page's own behavior. This is a real security boundary enforced by the user agent (the browser) on behalf of the user, independent of and unable to be bypassed by the requesting page's own JavaScript — a page cannot simply choose to ignore CORS and read the response anyway.

Also recognized in: firewall default-deny rules, file permission systems requiring explicit grants, and any capability-based security model where access must be explicitly extended rather than implicitly assumed — see `default-deny-security-pattern.md` for the general pattern this instantiates.

## SE Lens

A real, common alternative to configuring CORS is avoiding cross-origin requests entirely — serving a frontend's files from the exact same server/port/origin as its API, making every request same-origin by construction, with no CORS configuration needed at all. That approach is simpler but forfeits the benefits of running two separate, independently-configured dev servers (for instance, a frontend tool's own fast reload cycle); real projects choose per situation, and when the two-origin approach is chosen, CORS configuration becomes a real, necessary, security-relevant piece of infrastructure — not optional boilerplate, and not something to over-permit (allowing every origin, `"*"`, rather than a specific named one) once real, non-public data is involved.

## Connection

Builds on `http-request-response.md` and `fetch-api.md`. Directly relates to `default-deny-security-pattern.md` (the general principle CORS instantiates) and `vite-dev-server-config.md` (the dev-server port that must match a CORS allow-list exactly for this to work at all).

## Try It Yourself

1. Change Server A's `CORS(app, origins=["http://localhost:5180"])` to a different, wrong port (e.g. `5181`) and reload Server B's page — reproduce the exact CORS error again, and confirm it's the *browser's* console showing it, not any error returned by the server itself (check the Network tab: the response actually arrived with a real status code).
2. Change `origins=["http://localhost:5180"]` to `origins="*"` (allow any origin) and reason about why this removes the specific protection CORS exists to provide, even though it "fixes" the error just as effectively for this one legitimate case.
3. Look up "CORS preflight request" and `OPTIONS` HTTP requests — reproduce one by opening the Network tab, making the cross-origin `fetch` request, and finding the separate `OPTIONS` request the browser sent *before* the real `GET`/`POST` — this is what the earlier error message's "preflight request" was referring to.
