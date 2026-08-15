# Lesson 29: FastAPI Project Setup and the First Endpoint

**What you will build:** a real, running HTTP server — Arc 4's own
first real piece — answering one real request over the network,
proving Lesson 28's own architectural case with running code for the
first time.

**What you need to know first:** [Lesson 28](lesson-28-why-a-backend-at-all.md)
— the real, direct case for why this lesson's own server needs to
exist at all.

**Terms introduced in this lesson:**
- **HTTP** — the real, standard protocol web browsers, and this
  lesson's own `curl` command, use to request something from a server
  and receive a real, structured response back.
- **Endpoint** (also called a **route**) — one real, specific URL path
  a server recognizes and knows how to answer.
- **JSON** — a real, standard, text-based format for structured data
  (`{"key": "value"}`) — what this lesson's own endpoint sends back, and
  the same real format every later endpoint in this arc uses.

**Objects and methods used:**

**`FastAPI`**
- *What it is:* a real, third-party Python web framework
  (`pip install fastapi`).
- *Implementation:* `app = FastAPI()` creates a real application
  object; decorating a function with `@app.get("/path")` registers that
  function as the real handler for `GET` requests to `/path`.
- *Its use:* `app`, this lesson's own real server object, and the
  object every later endpoint in this arc is added to.

**`uvicorn`**
- *What it is:* a real, third-party ASGI server (`pip install uvicorn`)
  — the actual real program that listens on a real network port and
  hands incoming HTTP requests to a FastAPI `app`.
- *Implementation:* run from a real terminal as `uvicorn
  module_name:app_variable_name --reload` — `--reload` restarts the
  real server automatically whenever the source file changes, a real
  convenience during development.
- *Its use:* the real process that makes this lesson's own `app`
  actually reachable over the network at all; `FastAPI` itself defines
  *what* to answer, `uvicorn` is what actually *listens*.

---

## Concept Unit: A Real Server, Answering One Real Request

### The Problem

Lesson 28 made the real case for a backend. What does the smallest
possible real one actually look like, running?

### Introduce the Concept in Isolation

A real, complete file — genuinely the whole thing, five lines:

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Pocket Hardware API"}
```

Started for real, from a real terminal:

```
$ uvicorn main:app --reload
INFO:     Will watch for changes in these directories: [...]
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [...] using StatReload
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

A real, running process, now genuinely listening on port `8000` of this
machine — exactly the real, network-reachable address Lesson 28's own
second problem (a file path means nothing to any other real client)
already named directly. A real request, from a second, real terminal:

```
$ curl http://127.0.0.1:8000/
{"message":"Pocket Hardware API"}
```

A real, genuine HTTP response — `read_root`'s own returned Python
`dict`, `{"message": "Pocket Hardware API"}`, converted automatically
into real JSON text and sent back over the real network connection
`curl` opened. FastAPI also builds a second, real, genuinely useful
artifact from this same five-line file with no extra work: visiting
`http://127.0.0.1:8000/docs` in a real browser shows a live, interactive
page listing every real endpoint this `app` defines — one, so far —
generated directly from the real code, not maintained by hand
separately.

### Discard

Nothing throwaway — `main.py` is real, permanent, and every later
lesson in this arc adds to this exact file.

### Mechanical Walkthrough

- `from fastapi import FastAPI` — **(a) first appearance**, importing
  this lesson's own real framework.
- `app = FastAPI()` — **(a) first appearance**, full treatment above.
- `@app.get("/")` — **(a) first appearance** of a real Python
  **decorator** (already-known Python syntax, applied here to a genuinely
  new purpose) registering `read_root` as the handler for `GET`
  requests to the real path `/`; `"/"` — **(a) first appearance** of a
  real **path**: the specific part of a URL after the host and port
  that identifies which endpoint a request is for.
- `def read_root(): return {"message": "Pocket Hardware API"}` —
  **(c) already basic**, an ordinary Python function returning an
  ordinary `dict`; FastAPI's own real, automatic conversion of that
  `dict` into real JSON text on the way out is this unit's own point,
  not new Python syntax.
- `uvicorn main:app --reload` — **(a) first appearance**, full
  treatment above; `main:app` names the real module (`main.py`) and the
  real variable inside it (`app`) uvicorn should serve.

### CS Lens

`@app.get("/")` registering `read_root` is a real instance of a
**routing table**: a mapping from a real, structured key (an HTTP
method plus a path) to the real code that should run when a request
matches it — the identical underlying idea behind every web framework's
own router, a browser's own URL-to-page navigation, and a plain Python
`dict` used to dispatch on a string key instead of writing a long chain
of `if`/`elif` statements.

### SE Lens

The real division of labor between `FastAPI` and `uvicorn` — one
defines *what* to answer, the other actually *listens and answers* — is
a real, deliberate separation this project benefits from directly: the
real ASGI standard (uvicorn's own protocol) means this exact same
`app` object could run under a completely different real server later
(Arc 4's own eventual production deployment might use `gunicorn` with
uvicorn workers, a real, common pattern) with zero change to `main.py`
itself — the identical real portability principle Lesson 25's own CS
Lens already named for a stable file format, now applied to a stable
application interface instead.

## Connect the pieces

One real, five-line file, `main.py`, and one real terminal command,
`uvicorn main:app --reload`, together produced a genuine, running
server — confirmed with a real `curl` request returning real JSON, and
a second, real, automatically-generated interactive documentation page
at `/docs`, built from the identical source with no separate
maintenance. This is Lesson 28's own real backend, existing for the
first time, even though it doesn't touch `pocket_hardware.db` yet at
all.

## What breaks without this

Request a path this `app` never defined:

```
$ curl -i http://127.0.0.1:8000/nonexistent
HTTP/1.1 404 Not Found
content-type: application/json

{"detail":"Not Found"}
```

A real, specific, correct response — not a crash, not a hang, and not
`main.py`'s own `read_root` running by mistake. FastAPI's own real
routing correctly recognizes `/nonexistent` matches no registered
endpoint, and responds with a real, standard HTTP status code (`404`)
this series' own Lesson 35 gives full treatment — proof the routing
table this unit's own CS Lens named is real and enforced, not merely
descriptive.

## Exercises

1. Add a real second endpoint, `@app.get("/health")`, returning
   `{"status": "ok"}`, without removing `read_root`. Confirm both
   endpoints work with real `curl` requests, and confirm `/docs` now
   lists both.
2. Stop the real server (`Ctrl+C`), change `read_root`'s own returned
   message, and restart it *without* `--reload`. Confirm the change
   only takes effect after a real restart — then redo the same edit
   with `--reload` running instead, and confirm the real server picks
   it up automatically, with no manual restart at all.

## Definition of Done

- [ ] You ran a real FastAPI server with `uvicorn` and confirmed it's
      listening with a real `curl` request.
- [ ] You viewed the real, automatically-generated `/docs` page in a
      browser.
- [ ] You caused the real `404 Not Found` response and understand why
      it's FastAPI's own correct, deliberate answer, not an error.
- [ ] You completed both exercises.

## Next

[Lesson 30 — Pydantic Models](lesson-30-pydantic-models.md) gives this
lesson's own hand-written `{"message": "..."}` dict a real, validated,
structured shape — this arc's own first real defense against a
malformed request.
