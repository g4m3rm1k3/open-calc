# Lesson 36: CORS

**What you will build:** the real, final piece of this arc's own
backend — a correctly configured `CORSMiddleware` — and direct,
honest proof of exactly which real caller CORS actually blocks (a
browser's own JavaScript) and which one it never touches at all
(`curl`, or Arc 5's own Python-side `pywebview` code).

**What you need to know first:** [Lesson 29](lesson-29-fastapi-project-setup-and-the-first-endpoint.md)
— this arc's own real `app`, extended one final time in this lesson.
[Lesson 27](lesson-27-opening-the-same-db-from-a-browser.md) — the real
browser security boundary this lesson's own subject is a second,
different instance of.

**Terms introduced in this lesson:**
- **Origin** — a real, specific combination of protocol, host, and
  port (`http://localhost:8000` and `http://localhost:5500` are two
  genuinely different real origins, even on the same machine).
- **Same-Origin Policy** — a real, browser-enforced security rule: a
  real web page's own JavaScript may only freely read responses from
  the exact origin it was itself loaded from, unless the *server*
  explicitly grants an exception.
- **CORS (Cross-Origin Resource Sharing)** — the real, standard
  mechanism a server uses to grant that exception: specific real HTTP
  response headers telling a browser "this other, different origin is
  allowed to read my response."

**Objects and methods used:**

**`fastapi.middleware.cors.CORSMiddleware`**
- *What it is:* a real, built-in FastAPI middleware class.
- *Implementation:* `app.add_middleware(CORSMiddleware,
  allow_origins=[...], allow_methods=[...], allow_headers=[...])` —
  every real response this `app` sends afterward automatically includes
  the real CORS headers needed to permit real browser requests from the
  listed origins.
- *Its use:* letting Arc 5's own real, browser-rendered UI (a genuinely
  different origin from this arc's own `http://127.0.0.1:8000`) call
  this backend at all.

---

## Concept Unit: The Same-Origin Policy — a Real, Browser-Only Restriction

### The Problem

Arc 5's own real desktop UI is a genuine web page — Lesson 27 already
proved a browser (and `pywebview`'s own embedded one, per this series'
own Lesson 37) is a real, distinct environment with its own real
security rules a plain Python script never has to follow. Does that
page's own JavaScript reach this arc's own `http://127.0.0.1:8000`
endpoints the same way `curl` has, throughout this entire arc?

### Introduce the Concept in Isolation

A real, minimal HTML page, served from a genuinely different real
origin than this arc's own backend (`http://localhost:5500`, a real,
separate static file server, versus the backend's own
`http://127.0.0.1:8000`):

```html
<script>
fetch("http://127.0.0.1:8000/parts")
    .then((response) => response.json())
    .then((data) => console.log(data));
</script>
```

Opened in a real browser, with this arc's own real backend already
running: the real browser console shows a genuine, blocked request:

```
Access to fetch at 'http://127.0.0.1:8000/parts' from origin
'http://localhost:5500' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested
resource.
```

The real, honest, easy-to-misread part of this failure: this arc's own
backend genuinely *did* process the request and *did* send back a real,
correct `200 OK` with real JSON — proven directly by running the
identical request with `curl` at the same real moment and getting a
real, successful response, exactly like every earlier lesson in this
arc. The browser itself is what refused to let this specific page's own
JavaScript *read* that real response — a real restriction enforced
entirely client-side, by the browser, never by the server choosing to
reject the request.

### Discard

The real, minimal HTML page above is disposable proof of this lesson's
own single point — never a permanent part of this project; Arc 5's own
real UI is built starting Lesson 39.

### Mechanical Walkthrough

- `fetch("http://127.0.0.1:8000/parts")` — **(b) hard concept
  reappearing**, Lesson 27's own real, standard browser `fetch` API,
  unchanged.
- The real CORS error itself — not code; a real, browser-generated
  message, shown here as direct evidence rather than something this
  lesson's own code produces.

### CS Lens

The Same-Origin Policy is a real, deliberate **security boundary
enforced by the consumer, not the producer** — a genuinely unusual
shape worth naming directly: this arc's own server has no real say in
whether it *runs*; the browser, reading the response on the *caller's*
own behalf, is what decides whether the caller's own code is allowed to
see it, based on rules the caller's own environment enforces regardless
of what the server wanted.

Also recognized in: a browser's own sandboxed iframe restricting what a
nested page can access regardless of that nested page's own intent, an
operating system's own process isolation preventing one process from
reading another's memory even if both would happily cooperate, a
firewall enforcing a real network policy the two communicating
endpoints themselves have no ability to override.

### SE Lens

The real, deliberate reason this restriction exists at all: without it,
a real, malicious web page could silently make requests to *any* other
real site a visitor happens to be logged into (a real bank, a real
email provider) and read the response, using the *visitor's own,
already-authenticated* browser session — a real, serious vulnerability
class named Cross-Site Request Forgery-adjacent data theft. The
Same-Origin Policy's own real cost, honestly stated: it also blocks
every genuinely legitimate cross-origin request (this arc's own real
UI, calling its own real backend) unless the server explicitly, real
opts in — which is precisely this lesson's own next, and final, real
unit.

## Concept Unit: `CORSMiddleware` — Explicitly Granting the Exception

### The Problem

This arc's own backend needs to explicitly tell real browsers "requests
from Arc 5's own real UI origin are allowed to read my responses."

### Introduce the Concept in Isolation

A real, small addition, near the top of `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

The identical real HTML page from this lesson's first unit, run again
with no other change:

```
$ curl -i -H "Origin: http://localhost:5500" http://127.0.0.1:8000/parts | head -5
HTTP/1.1 200 OK
access-control-allow-origin: http://localhost:5500

[{"id":1,"name":"Hammer", ...}, ...]
```

A real, new response header, `access-control-allow-origin:
http://localhost:5500`, present now specifically because the real
request declared its own real `Origin` and that origin matches this
lesson's own configured `allow_origins` list. A real browser, seeing
this exact header on the real response, permits the calling page's own
JavaScript to actually read it — the real console error from this
lesson's own first unit is gone.

### Discard

Nothing throwaway — `CORSMiddleware`, configured with Arc 5's own real
origin, is a real, permanent part of `main.py` from here on.

### Mechanical Walkthrough

- `from fastapi.middleware.cors import CORSMiddleware` — **(a) first
  appearance**, importing this lesson's own real subject.
- `app.add_middleware(CORSMiddleware, allow_origins=[...],
  allow_methods=["*"], allow_headers=["*"])` — **(a) first appearance**
  of `add_middleware` and this specific real middleware's own
  configuration: `allow_origins` — the real, explicit allowlist of
  origins permitted to read this app's responses; `allow_methods`/
  `allow_headers`, each set to `"*"` here — a real, deliberate
  simplification permitting every real HTTP method and header, correct
  for this project's own current, single-frontend scope, and named
  honestly as a real, broad grant rather than left unexamined.

### CS Lens

`CORSMiddleware` is a real instance of the **middleware pattern**:
code that wraps every real request/response passing through an
application, adding a real, cross-cutting behavior (here, a security
header) without any individual endpoint (`list_parts`, `create_part`,
and every other one across this arc) needing to know it exists or add
anything itself.

Also recognized in: logging middleware recording every real request
regardless of which endpoint handled it, authentication middleware
checking a real token before any endpoint's own code runs, Express.js's
own real middleware chain in Node.js — the identical underlying shape
in a genuinely different language and framework.

### SE Lens

The real, honest security tradeoff `allow_origins`'s own specific value
represents: a real, common shortcut — `allow_origins=["*"]`, permitting
*any* real origin — would remove the real friction of maintaining an
explicit list, at the real cost this lesson's own first unit already
justified the Same-Origin Policy around: any real, arbitrary website
could then read this backend's own real data using a visitor's browser.
Naming Arc 5's own real, specific origin explicitly is the correct,
deliberate choice for a project with a known, fixed set of real
clients — the same real principle behind an allowlist generally,
chosen over a permissive default the instant the set of legitimate
callers is actually known in advance.

## Connect the pieces

One real, browser-only restriction, proven directly: a real page from
`http://localhost:5500` was genuinely blocked from reading this arc's
own `http://127.0.0.1:8000` response, even though the backend itself
processed the request correctly the whole time — confirmed
independently with `curl`, which no CORS rule ever restricts at all.
`CORSMiddleware`, configured with Arc 5's own real, specific origin,
then closed that gap explicitly, proven by the real
`access-control-allow-origin` header now present on every real
response.

## What breaks without this

Request the identical endpoint with a real `Origin` header this
lesson's own `allow_origins` list does *not* include:

```
$ curl -i -H "Origin: http://evil.example" http://127.0.0.1:8000/parts | head -3
HTTP/1.1 200 OK

[{"id":1,"name":"Hammer", ...}, ...]
```

The real response body is identical, and no `access-control-allow-
origin` header appears at all — proof, once more, that the *server*
never refuses the request itself; a real browser, and only a real
browser, receiving this exact same response, would see the missing
header and correctly block `http://evil.example`'s own JavaScript from
reading it, the identical real mechanism this lesson's own first unit
already demonstrated, now shown to correctly discriminate between an
allowed and a disallowed real origin.

## Exercises

1. Reproduce this lesson's own real `curl -H "Origin: ..."` proof
   yourself, once with Arc 5's own configured origin and once with a
   different one, and confirm the real, present-or-absent
   `access-control-allow-origin` header directly.
2. Research FastAPI's own real `allow_credentials` CORS option — state,
   in your own words, what real, additional risk it introduces if
   combined carelessly with `allow_origins=["*"]`, and why this
   project's own explicit origin list makes that combination safe here
   should a future lesson ever need real, credentialed requests.

## Definition of Done

- [ ] You reproduced the real, blocked CORS error from a genuinely
      different origin's own browser JavaScript.
- [ ] You confirmed, with `curl`, that the backend itself processed the
      blocked request correctly the whole time.
- [ ] You added `CORSMiddleware` and confirmed the real
      `access-control-allow-origin` header now appears for Arc 5's own
      configured origin.
- [ ] You completed both exercises.

## Arc 4 complete

Nine lessons, and this project now has a real, running backend: Lesson
28 made the real case for it; Lesson 29 got a real server running;
Pydantic (Lesson 30) validates every real request and shapes every real
response; `Depends(get_db)` (Lesson 31) supplies a real, correctly-
configured connection per request; `GET`/`POST`/`PUT`/`DELETE` (Lessons
32–33) give this project full, real CRUD over HTTP; pagination (Lesson
34) bounds every real response; honest `404`/`500` handling (Lesson 35)
replaces silent, broken responses with real, correct ones; and
`CORSMiddleware` (this lesson) opens the real, final door Arc 5's own
browser-based UI needs to walk through.
[Arc 5](lesson-37-what-pywebview-is.md) builds that real UI next — a
genuine desktop window, a real web page inside it, and jQuery
DataTables rendering this exact backend's own real data.
