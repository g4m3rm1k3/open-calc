# Lesson 1: Two Programs Learning to Talk

## What you will build

A FastAPI backend with one route, and an HTML page that asks it a
question over the network and shows the answer. Small on purpose — this
lesson is about three problems every system with more than one moving
part runs into (isolating dependencies, registering behavior without
rewriting it, and crossing a trust boundary between two programs that
don't inherently trust each other), not about this specific feature.

## What you need to know first

Nothing. This is the first lesson.

---

## Concept Unit: isolating dependencies

### The Problem

Before any code in this project can run, Python needs `fastapi` and
`uvicorn` installed. Installing them globally works, until a second
project on the same machine needs a different, incompatible version of
one of them — a global install can only ever satisfy one project at a
time.

### The Commands

```powershell
mkdir backend
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

`python -m venv .venv` creates a **virtual environment** — an isolated,
self-contained copy of Python's package-installation location, tied to
this folder instead of the whole machine. `.\.venv\Scripts\Activate.ps1`
modifies the current terminal session so that `python` and `pip`, typed
plainly from here on, resolve to the copies inside `.venv/` instead of
the system-wide ones — confirmed directly, this actually changes what
`python` points at:

```powershell
(Get-Command python).Source
# C:\...\backend\.venv\Scripts\python.exe   (before activation: the system path instead)
```

Create `requirements.txt` with the two packages this project directly
needs — each on its own line, no version attached yet:

```
fastapi
uvicorn
```

With that file in place, install those packages into the now-active
virtual environment, then list everything that actually got installed:

```powershell
pip install -r requirements.txt
pip freeze
```

### SE Lens — why `pip freeze` matters, not just `pip install`

Run against this project, `pip install` actually pulled in fourteen
packages, not two — `fastapi` depends on `pydantic`, `starlette`, and
others; `pip` resolves that whole chain automatically. `pip freeze` lists
every one of them pinned to its *exact* installed version:

```
annotated-doc==0.0.4
annotated-types==0.7.0
anyio==4.14.2
click==8.4.2
colorama==0.4.6
fastapi==0.139.0
h11==0.16.0
idna==3.18
pydantic==2.13.4
pydantic_core==2.46.4
starlette==1.3.1
typing-inspection==0.4.2
typing_extensions==4.16.0
uvicorn==0.51.0
```

`requirements.txt` originally just said `fastapi` and `uvicorn` — no
version attached, which means "install whatever's newest right now," a
moving target. Overwrite `requirements.txt` with the `pip freeze` output
above so a fresh install months from now installs the *same* versions
this project was actually built and tested against, not whatever happens
to be current then. That's the real tradeoff: a bare package name is
convenient to write and a real reproducibility risk; a pinned version is
one more line to maintain and a guarantee that "works on my machine" still
means something on a different machine, or this same machine later.

This sets up everything that follows — nothing below runs without it.

---

## Concept Unit: attaching behavior without rewriting the code

### The Problem

Something needs to know "when a GET request for `/health` arrives, call
this function." There's more than one way to say that, and the
difference is worth seeing before committing to one.

### Concept Lab — Decorators

```python
def shout(func):
    def wrapper():
        result = func()
        return result.upper()
    return wrapper

@shout
def greet():
    return "hello"

print(greet())
```

Run this. It prints `HELLO`, not `hello`.

### What This Proves

`shout` is a function that takes another function (`func`) and returns a
new one (`wrapper`) that calls the original and modifies its result.
`@shout` written above `def greet():` is shorthand for
`greet = shout(greet)` — it replaces `greet` with the wrapped version the
instant the file loads, so calling `greet()` afterward actually runs
`wrapper`, not the original body directly. A decorator lets you attach
extra behavior to a function without touching that function's own code.

### Discard

This code is deleted now — `shout` and `greet` never appear in the
project. The real decorator does a different job (registering a route,
not shouting), but the same underlying mechanism.

### Project Change

- **Files affected** — `backend/main.py`, new file.
- **Change type** — create.
- **Location** — the entire file; nothing exists yet to place this
  relative to.
- **Dependencies** — the `fastapi` package installed in the previous unit.

### The New Code — type this

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}
```

This is a brand-new file — `backend/main.py` doesn't exist before this
unit — so there's no larger surrounding structure to place it inside yet;
the whole file *is* the new code. The next unit adds to this file, and
starting there, every addition gets shown both on its own and back in
context.

### Mechanical Walkthrough

`from fastapi import FastAPI` is an **import statement** — it pulls the
name `FastAPI` out of the `fastapi` package (installed in the previous
unit) and makes it available in this file. `app = FastAPI()` creates one
running instance of the application; every route this project adds
attaches to this specific `app` object. `@app.get("/health")` is the same
shape just demonstrated in the lab — it wraps `health_check`, and what it
attaches is "remember this function; run it for GET requests to
`/health`." `def health_check():` defines a function with no parameters —
the same `def` syntax used inside `shout` above. `return {"status": "ok"}`
returns a **dictionary literal** — a set of key-value pairs in `{}` —
which FastAPI automatically converts to a JSON response; nothing in this
function converts it explicitly.

### CS Lens

This is the same underlying pattern other frameworks solve differently:
Java/C# read annotations/attributes at startup; Ruby on Rails uses
`before_action` callbacks; Express.js (Node) threads middleware functions
through each request. Different syntax, same decision — attach
cross-cutting behavior at the point something is defined, rather than in
a separate registry.

### SE Lens

The alternative is registering routes somewhere else entirely —
`app.add_url_rule("/health", health_check)` in a separate setup block,
which is exactly how older Flask code does it. That costs you two places
to check instead of one: the function, and wherever it got wired up. In a
project with a hundred routes, that registration block becomes a hundred
lines of bookkeeping disconnected from the code it's bookkeeping *for*.
The cost on the other side: because the decorator *is* the registration,
two functions accidentally decorated with the same path don't raise an
error — FastAPI just keeps one and silently shadows the other. There's no
compiler catching this; it's worth remembering once this project has
enough routes for two to collide by accident.

### Run It

From inside `backend/`, with the venv still active:

```powershell
python -m uvicorn main:app --port 8000
```

A successful start ends with this line, and the terminal then sits
waiting — that's normal, it means the server is running and listening:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

In a second terminal, with the server still running, request the route
directly:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing
```

Actual result: `StatusCode 200`, content `{"status":"ok"}`.

### Connects To

This connects directly to the environment work above — none of this runs
without the venv from the first unit actually being active.

---

## Concept Unit: crossing a trust boundary

### The Problem

`index.html`, opened as a local file, and this backend on port 8000 are
two separate programs. Browsers enforce the **same-origin policy**:
JavaScript on one origin is blocked from *reading* a response from a
different origin — even when the request itself succeeds. This isn't an
arbitrary inconvenience: a browser tab runs whatever code the current
website serves, and that code inherits your cookies and login sessions
for every other open site. Without this policy, a page you visited by
accident could silently query your bank's API using your still-logged-in
session and read the response. Same-origin isolation is the defense
against exactly that.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — a new import line alongside the existing
  `from fastapi import FastAPI`, and a new block placed after
  `app = FastAPI()`, before the `@app.get("/health")` route added in the
  previous unit.
- **Dependencies** — none beyond what's already installed; `CORSMiddleware`
  ships with `fastapi` itself.

### The New Code — type this

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### The Updated Project — where this lives

Now see it in place:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware          # ← new

app = FastAPI()

app.add_middleware(                                          # ← new
    CORSMiddleware,                                          # ← new
    allow_origins=["*"],                                     # ← new
    allow_methods=["*"],                                     # ← new
    allow_headers=["*"],                                     # ← new
)                                                             # ← new


@app.get("/health")
def health_check():
    return {"status": "ok"}
```

That's the entire file so far — one new import and one new block, placed
between the app being created and the `/health` route from the previous
unit. `health_check` itself is untouched; every response it sends now
simply passes through this middleware first.

### Mechanical Walkthrough

`from fastapi.middleware.cors import CORSMiddleware` imports this one
class from FastAPI's own middleware module — the same kind of import
statement as `FastAPI` itself in the previous unit, just a different name
from a different location inside the same package. `CORSMiddleware`
(Cross-Origin Resource Sharing) adds a response header —
`Access-Control-Allow-Origin` — that tells the browser "pages from other
origins may read this." `add_middleware` registers it to run on every
response this app sends. `allow_origins=["*"]` sets that header's value
to `*`, granting permission to any origin. `allow_methods=["*"]` and
`allow_headers=["*"]` are the same idea applied to two other axes CORS
separately controls — which HTTP methods (`GET`, `POST`, `PUT`, ...) a
cross-origin request is allowed to use, and which request headers it's
allowed to send — both also wide open here for the same reason
`allow_origins` is: nothing sensitive to protect yet.

### What Was Actually Verified, Not Assumed

The same `/health` request, sent with an `Origin` header the way a real
cross-origin browser fetch would, with `CORSMiddleware` active:

```
Access-Control-Allow-Origin header: *
```

Then, with `add_middleware(...)` commented out and the server restarted,
the *exact same request*:

```
StatusCode: 200
Body: {"status":"ok"}
Access-Control-Allow-Origin header present: False
```

This is the actual mechanism, confirmed directly: the request succeeds
either way — same status code, same body. Only the header differs. The
header's presence is what a real browser checks before letting the
page's own JavaScript read the response; its absence is what triggers the
same-origin policy block. CORS was never about stopping the request from
being sent.

### SE Lens

`"*"` is acceptable *right now* for one specific reason: this backend has
no logged-in user yet, so there's no session or cookie a malicious page
could ride along with. The moment this project adds authentication —
already on this project's roadmap — `allow_origins=["*"]` stops being a
convenience and becomes a real vulnerability, because now there's
something worth stealing. A deployed production system would replace
`"*"` with the exact origin of its real frontend — an allow-list of one,
not everyone.

---

## Concept Unit: a page to test from

### The Problem

Something has to display whatever the backend says.

### Project Change

- **Files affected** — `index.html`, new file, at the project root (one
  level above `backend/`, not inside it — this file is opened directly
  by a browser, not served by the Python process).
- **Change type** — create.
- **Dependencies** — none; this file has no relationship to the venv or
  packages installed for the backend.

### The New Code — type this

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Code Editor</title>
</head>
<body>
    <p id="status">Connecting...</p>
</body>
</html>
```

This is a brand-new file — `index.html` doesn't exist before this unit —
so, as with `main.py` in the second unit, there's no larger structure to
place it inside yet.

### Mechanical Walkthrough

`<!DOCTYPE html>` tells the browser to render this as modern HTML.
`<html>`, `<head>`, and `<body>` are the three required top-level
sections every HTML document has — `<head>` holds metadata the page
itself doesn't display (here, the character encoding and the browser
tab's title), `<body>` holds everything actually shown on screen. `<p>`
is a paragraph element. `id="status"` gives this specific element a
unique name, `status`, that other code can look it up by — the
JavaScript below does exactly that.

---

## Concept Unit: code that depends on something slow

### The Problem

A network request takes real, unpredictable time. JavaScript in a
browser runs on a single thread that also handles rendering and clicks —
if `fetch()` simply *blocked* until a response arrived, the whole page
would freeze for however long the network took.

### Concept Lab — Promises

```javascript
function fetchNumberEventually() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(42);
        }, 1000);
    });
}

fetchNumberEventually().then((value) => {
    console.log("Got:", value);
});

console.log("This prints first.");
```

Run this. `"This prints first."` prints *before* `"Got: 42"` — even
though `fetchNumberEventually()` was called first in the code.

Now vary it — replace `resolve(42)` with `reject("network down")` and add
a second call:

```javascript
fetchNumberEventually()
    .then((value) => console.log("Got:", value))
    .catch((error) => console.log("Failed:", error));
```

This prints `Failed: network down` instead — `.then()` never runs at all.

### What This Proves

A `Promise` represents a value that doesn't exist yet but will.
`setTimeout(..., 1000)` schedules `resolve` or `reject` to run roughly a
second later, without blocking anything else — the line immediately
after the call runs first regardless. `.then(fn)` registers `fn` to run
only if the promise resolves; `.catch(fn)` registers a *different*
function to run only if it rejects instead — never both.

### Discard

This code is deleted now — `fetchNumberEventually` never appears in the
project.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add.
- **Location** — a new `<script>` element, placed just before the closing
  `</body>` tag, after the `<p id="status">` element added in the
  previous unit.
- **Dependencies** — the backend from the earlier units must actually be
  running on port 8000 for this to succeed.

### The New Code — type this

```html
<script>
    fetch("http://127.0.0.1:8000/health")
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("status").textContent = "Backend says: " + data.status;
        })
        .catch((error) => {
            document.getElementById("status").textContent = "Could not reach backend.";
        });
</script>
```

### The Updated Project — where this lives

Now see it in place:

```html
<body>
    <p id="status">Connecting...</p>
    <script>                                                                  <!-- ← new -->
        fetch("http://127.0.0.1:8000/health")                                 <!-- ← new -->
            .then((response) => response.json())                             <!-- ← new -->
            .then((data) => {                                                <!-- ← new -->
                document.getElementById("status").textContent = "Backend says: " + data.status;  <!-- ← new -->
            })                                                                <!-- ← new -->
            .catch((error) => {                                              <!-- ← new -->
                document.getElementById("status").textContent = "Could not reach backend.";  <!-- ← new -->
            });                                                               <!-- ← new -->
    </script>                                                                 <!-- ← new -->
</body>
```

The `<p id="status">` element is unchanged from the previous unit — still
showing "Connecting..." the instant the page loads. The new `<script>`,
placed right after it, is what actually replaces that text a moment
later, once the request the script starts has settled one way or the
other.

### Mechanical Walkthrough

`<script>` is the HTML element that embeds JavaScript directly in the
page. `fetch(url)` starts the request and returns a Promise immediately —
the exact shape from the lab, real this time. The first
`.then((response) => response.json())` runs once headers arrive and
itself returns another Promise, since parsing the body as JSON takes its
own moment. The second `.then((data) => { ... })` runs once that parsing
finishes. `.catch(...)` runs instead of either `.then()` if the chain
fails at any point — network failure, or CORS rejecting the response,
exactly as demonstrated in the lab's rejection case.

### SE Lens

Before Promises existed in JavaScript, this exact problem was solved with
plain callbacks passed directly into the async call — workable for one
step, unreadable once several async steps had to happen in sequence, each
nested inside the last (developers actually nicknamed this "callback
hell"). `.then()` chaining composes left-to-right instead of nesting
deeper with each step — a direct response to that specific pain.

---

## Concept Unit: looking up an element by id

### The Problem

The parsed response needs to actually change what the page displays —
before it can change anything, the code needs a reference to the exact
element to change. This and the next unit both isolate pieces of the
`<script>` block already typed in the previous unit — nothing new is
being added to the project here, only explained.

### The New Code — type this

```javascript
document.getElementById("status")
```

### Mechanical Walkthrough

`document` is the browser's built-in object representing the whole page.
`.getElementById("status")` searches the DOM tree — the browser's
in-memory representation of the HTML — for the one element whose `id`
attribute equals `"status"`, and returns it, or `null` if none exists.
This is the same `id="status"` set on the `<p>` element earlier.

---

## Concept Unit: mutating displayed text

### The Problem

Having found the element, its displayed content needs to actually change
to reflect what the backend said — a second, separate concept riding in
the same statement as the lookup above, which is why it's taught as its
own unit rather than folded into the previous one.

### The New Code — type this

```javascript
.textContent = "Backend says: " + data.status;
```

### Mechanical Walkthrough

`.textContent` is a property holding an element's displayed text;
assigning to it replaces whatever was there. `+` here concatenates two
strings into one — the same operator, doing the same job, as
`entry.name + "/"` will in Lesson 2, just introduced here first.

### Connects To

Together, this unit and the previous one are the full statement inside
the `<script>` block's second `.then()`: look the element up, then
overwrite what it displays. Neither half means anything without the
other.

---

## Connect the pieces

```
Terminal: venv activated → pip install → pip freeze pins requirements.txt
              ↓
python -m uvicorn main:app --port 8000 → server listening on :8000
              ↓
Browser opens index.html (its own origin) → <script> runs immediately
              ↓
fetch("http://127.0.0.1:8000/health") → Promise returned, script continues
              ↓
Request crosses origins → arrives at the backend regardless
              ↓
@app.get("/health") registration routes it to health_check()
              ↓
{"status": "ok"} returned, CORSMiddleware attaches Access-Control-Allow-Origin: *
              ↓
Browser sees the header → allows the page's JS to read the response
              ↓
.then(response.json()) → .then(data => ...) → getElementById("status").textContent set
   — or, at any failed step —
.catch(error => ...) → fallback text shown instead
```

## What breaks without this

Already demonstrated concretely above, not hypothetically: removing
`CORSMiddleware` doesn't stop the request — status `200`, real body,
confirmed identical either way. What disappears is the
`Access-Control-Allow-Origin` header, confirmed present with the
middleware active and confirmed absent without it. That header's absence
is exactly what a real browser's same-origin policy checks before
blocking `index.html`'s JavaScript from reading the response — the page
would show "Could not reach backend," triggered by `.catch()`, even
though the backend answered correctly.

## Exercises

1. Run the backend yourself, open `index.html`, and confirm you see
   "Backend says: ok" — the real first live run of this file.
2. Stop the backend, reload the page, and confirm `.catch()` fires with
   "Could not reach backend."
3. Reproduce the CORS header test yourself: comment out
   `add_middleware(...)`, restart the server, and check the response
   headers with `Invoke-WebRequest`. Confirm the header is really gone,
   then restore the code.
4. In the decorator lab, write a second decorator, `@twice`, that repeats
   the wrapped function's returned string. Apply both `@shout` and
   `@twice` to `greet` and predict the output before running it.

## Definition of done

- [ ] You've activated the venv yourself and confirmed `python` resolves
      inside it
- [ ] You've run `pip install -r requirements.txt` and `pip freeze`
      yourself
- [ ] You can explain why colocating a route's registration with its
      definition is a tradeoff, not just "how Python works" — including
      what it costs, not just what it gains
- [ ] You've reproduced the CORS header test yourself and can explain
      what a browser actually checks
- [ ] You can explain why the backend never needed `.then()` anywhere but
      the frontend did — the architectural reason, not "JS needs it"
- [ ] `git add` and `git commit` this lesson's code with a message
      explaining why (e.g. "Add health check route with CORS enabled —
      first working backend/frontend connection"), not just what changed
