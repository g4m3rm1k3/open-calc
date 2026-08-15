# Lesson 01: The Shell

**What you will build:** a real, running FastAPI server, a real, static
JavaScript page it serves, and the four real, separate folders every
later lesson in this project builds inside — nothing that manages a
file yet, but a real, working request-response cycle, end to end,
proven before a single line of real business logic exists.

**What you need to know first:** real, working knowledge of Python and
JavaScript, per this project's own [README](README.md). Nothing about
FastAPI is assumed — this series' own sibling,
[`sqlite-mastery`](../sqlite-mastery/lesson-29-fastapi-project-setup-and-the-first-endpoint.md),
already gave it full, first-appearance treatment; this lesson reuses
that same real tool without re-deriving it from nothing, citing it
directly wherever it reappears.

**Terms introduced in this lesson:**
- **Layered architecture** — organizing a real system into a small
  number of distinct, ordered layers, each with exactly one real job,
  where each layer only ever talks to the layer directly below it —
  this project's own single, central structural decision, made once,
  here, before any real feature exists to justify it in isolation. (A
  real, deeper, general treatment of this same idea lives in this
  repo's own shared [`layered-architecture-dependency-direction.md`](../../concepts/layered-architecture-dependency-direction.md)
  concept file.)
- **Presentation layer** — the real code responsible only for showing
  state and capturing a real user's intent — here, a real, plain
  JavaScript page.
- **API layer** — the real code responsible for receiving a real
  request, validating it, and delegating to the real logic that
  actually handles it — here, FastAPI's own routes.
- **Domain layer** — the real code that enforces this project's own
  real business rules, with no knowledge of HTTP, no knowledge of SQL,
  and no real dependency on either the API or data layer's own
  concrete shape.
- **Data layer** — the real code responsible for persisting and
  retrieving data — this project's own real SQLite database and,
  starting Lesson 13, its own real, canonical git repository.

**Objects and methods used:**

**`fastapi.staticfiles.StaticFiles`**
- *What it is:* a real, built-in FastAPI (Starlette) class for serving
  real, ordinary static files — HTML, CSS, JavaScript — directly from a
  real, local folder.
- *Implementation:* `app.mount("/", StaticFiles(directory="static",
  html=True), name="static")` — `directory` names the real, local
  folder to serve from; `html=True` makes a request for a real
  directory (including `/` itself) automatically serve that
  directory's own `index.html`, the same real behavior an ordinary web
  server provides.
- *Its use:* serving this project's own real, first, static page — no
  separate real frontend build tool, no separate real server process.

---

## Concept Unit: Four Real Folders, Before Any Real Feature

### The Problem

This project's own [README](README.md) already names the real reason a
layered structure matters — Vault's own real diagnosis of an
unmaintainable, AI-grown system applies directly. Committing to that
real structure *before* any real feature exists means every later
lesson has an obvious, real, correct place for its own new code, rather
than a decision deferred until the codebase is already large enough for
getting it wrong to be expensive.

### Introduce the Concept in Isolation

No throwaway folders — this project's own real, permanent structure,
created directly:

```
$ mkdir -p src/api src/domain src/data static
$ touch src/__init__.py src/api/__init__.py src/domain/__init__.py src/data/__init__.py
```

Four real, empty Python packages — `src/api/`, `src/domain/`,
`src/data/` — plus `static/`, a real, plain folder (not a Python
package at all, since nothing inside it is ever imported by Python
code). Nothing inside any of them does anything yet; the real,
deliberate decision this unit makes is committing to *where* every
later real concept goes before deciding *what* it is.

### Discard

Nothing throwaway — every one of these four real folders is permanent,
and every later lesson in this project adds real code inside one of
them, by name.

### Mechanical Walkthrough

- `mkdir -p src/api src/domain src/data static` — **(c) already
  basic**, an ordinary shell command; the real, deliberate *names*
  chosen — matching this project's own README directly — are this
  unit's own point, not the command itself.
- `touch src/__init__.py ...` — **(a) first appearance** of Python's
  own real `__init__.py` file: an empty, real file whose only job is
  telling Python "this folder is a real, importable package," letting
  later code write `from src.domain import ...` correctly.

### CS Lens

A layered architecture is a real, concrete instance of **separation of
concerns**, enforced structurally rather than left as an unenforced
convention: `src/domain/` can be read, and reasoned about, with zero
knowledge of HTTP or SQL, because nothing in it is permitted to depend
on either — a real, direct answer to this project's own README-stated
failure mode, where nothing had a single, real responsibility at all.

Also recognized in: the OSI networking model (each layer serves the one
above it, using only the one below), a compiler's own real pipeline
(lexer → parser → codegen, each stage blind to the internals of the
next), MVC and its own many real variants — the identical underlying
shape, a small, ordered number of layers, each with one real job,
recurring at very different scales.

### SE Lens

The real alternative this project deliberately does not take — the one
its own README already names directly — is exactly what produced the
real, original, unmaintainable system: real code that reaches directly
across layers, a real API route that queries SQL directly, a real
domain function that imports FastAPI, because nothing enforced
otherwise. The real, honest cost of the disciplined alternative,
stated plainly: four real folders and an explicit rule, upheld
deliberately (Lesson 02's own real subject), rather than skipped for
speed on a Tuesday when a real feature "just needs one more query
right here."

## Concept Unit: A Real, First Request, End to End

### The Problem

Four real, empty folders prove nothing on their own. This project needs
one real, working request-response cycle before any of them hold real
logic.

### Introduce the Concept in Isolation

```python
# src/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

```html
<!-- static/index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Forge</title>
</head>
<body>
    <h1>Forge</h1>
    <p id="status">Checking API...</p>
    <script>
        fetch("/api/health")
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("status").textContent = "API: " + data.status;
            });
    </script>
</body>
</html>
```

```
$ uvicorn src.main:app --reload
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [...] using StatReload
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Visiting `http://127.0.0.1:8000/` in a real browser shows the real page
— `<h1>Forge</h1>`, and, an instant later, once the real, asynchronous
`fetch` resolves, `"API: ok"` — proof of a real, complete round trip:
the browser requested `/`, `StaticFiles` served `index.html` directly,
that page's own real JavaScript then requested `/api/health`
independently, and FastAPI's own real route answered it.

### Discard

Nothing throwaway — `main.py` and `index.html` are both real,
permanent, and every later lesson in this project extends them.

### Mechanical Walkthrough

- `from fastapi import FastAPI` / `app = FastAPI()` / `@app.get
  ("/api/health") def health(): return {"status": "ok"}` — **(b) hard
  concept reappearing**, `sqlite-mastery`'s own Lesson 29, in full —
  this exact real shape, unchanged.
- `from fastapi.staticfiles import StaticFiles` / `app.mount("/",
  StaticFiles(directory="static", html=True), name="static")` — **(a)
  first appearance**, full treatment above.
- `fetch("/api/health").then((response) => response.json()).then((data)
  => {...})` — **(b) hard concept reappearing**, `sqlite-mastery`'s own
  Lesson 27/38 real `fetch` shape, unchanged.

### CS Lens

`StaticFiles(html=True)` reusing the exact same server process and port
that also answers `/api/health` is a real, direct instance of a single
real server acting as **both** a static file host and a real API — the
identical underlying shape this project's own real, existing PyInstaller-
packaged app already uses in production, proven here in miniature,
before Lesson 29's own dedicated packaging lesson makes it permanent.

### SE Lens

The real, deliberate choice not to reach for a separate real frontend
build tool (a bundler, a framework) here: this project's own real
frontend is plain JavaScript, real and complete without one, and
introducing real, additional tooling this project's own actual,
existing app doesn't use would teach a real skill this project doesn't
actually need — the identical real discipline this whole project's own
README already commits to, choosing the real, existing stack over a
Vault-shaped substitute wherever the real, existing stack already
works.

## Connect the pieces

Four real, empty, permanent folders — `api`, `domain`, `data`, and
`static` — gave this project's own layered architecture a real,
physical home before any real feature justified it. `StaticFiles` and
one real FastAPI route then proved the first real, complete
request-response cycle: a real browser loading a real static page,
whose own real JavaScript independently reached a real, separate API
route, both served from the identical single, real process.

## What breaks without this

Reverse the real, deliberate order this lesson's own code was written
in — mount `StaticFiles` at `/` *before* defining `/api/health`:

```python
app = FastAPI()
app.mount("/", StaticFiles(directory="static", html=True), name="static")


@app.get("/api/health")
def health():
    return {"status": "ok"}
```

```
$ curl http://127.0.0.1:8000/api/health
{"detail":"Not Found"}
```

A real `404` — not from `health()`, which never runs at all. FastAPI
(via Starlette) matches real routes in the exact real order they were
registered; `app.mount("/", ...)` claims *every* real path beneath `/`,
including `/api/health`, the instant it's registered — and since it was
registered first here, it wins, looks for a real file literally named
`api/health` inside `static/`, finds none, and returns its own,
unrelated real `404` before FastAPI's own, later `/api/health` route is
ever consulted. This is direct, provable proof that a real, broad
mount like this one must be registered *last* — the exact, real order
this lesson's own first version already used, deliberately.

## Exercises

1. Add a real, second static file, `static/about.html`, and confirm
   `http://127.0.0.1:8000/about.html` serves it correctly, with no
   further real code required.
2. Reproduce this lesson's own real "what breaks" failure yourself,
   then fix it by moving the `StaticFiles` mount back to the end, and
   confirm `curl http://127.0.0.1:8000/api/health` returns the real,
   correct `{"status":"ok"}` again.

## Definition of Done

- [ ] You created the real, four-folder layered structure this
      project's own README describes.
- [ ] You ran a real FastAPI server serving both a real static page and
      a real API route from one process.
- [ ] You confirmed the real page's own JavaScript successfully calls
      `/api/health` and displays the result.
- [ ] You caused the real route-ordering failure and understood exactly
      why `StaticFiles`'s own broad mount must be registered last.
- [ ] You completed both exercises.

## Next

[Lesson 02 — The Domain Layer, For Real](lesson-02-the-domain-layer-for-real.md)
gives this lesson's own real, empty `src/domain/` folder a real,
enforced rule — and proves, by deliberately breaking it, exactly what
that rule is protecting against.
