# Lesson 02: The Domain Layer, For Real

**What you will build:** this project's own real, first domain
function — a pure, framework-agnostic file-type check — called
correctly from a real API route, and then, deliberately, called
incorrectly, to prove exactly what "the domain layer never imports
FastAPI" actually protects against, concretely, not just by assertion.

**What you need to know first:** [Lesson 01](lesson-01-the-shell.md) —
the real, empty `src/domain/` folder this lesson gives its first real
content, and the real rule ("this layer never imports FastAPI or SQL")
stated there without yet being tested.

**Terms introduced in this lesson:** none new — this lesson proves the
real, practical consequence of Lesson 01's own already-named domain-
layer boundary, rather than introducing a new concept.

**Objects and methods used:**

**`fastapi.APIRouter`**
- *What it is:* a real, built-in FastAPI class for grouping real routes
  into their own, separate, real module instead of every route living
  directly on the one, central `app` object.
- *Implementation:* `router = APIRouter()`, real routes declared on
  `router` exactly like they would be on `app` (`@router.get(...)`);
  `app.include_router(router)`, back in `main.py`, wires them in.
- *Its use:* `src/api/files.py`, this project's own real, first,
  separate API module — a real, necessary organization this project's
  own eventual real size (Vault's own real precedent: thirty real
  lessons' worth of routes) will need from here on, rather than one,
  ever-growing `main.py`.

---

## Concept Unit: A Real, Pure Domain Function

### The Problem

`src/domain/` is real and empty. This project's own real, first
business rule — which real file types Forge is even allowed to manage
— needs to live somewhere, and Lesson 01's own real rule says it
belongs here, not inside a route.

### Introduce the Concept in Isolation

```python
# src/domain/file_types.py
ALLOWED_EXTENSIONS = {".sldprt", ".sldasm", ".slddrw", ".pdf", ".docx", ".py"}


def is_allowed_file_type(filename: str) -> bool:
    if not filename:
        raise ValueError("filename must not be empty")
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)
```

A real, direct, isolated proof this function needs nothing beyond
plain Python:

```
$ python -c "from src.domain.file_types import is_allowed_file_type; print(is_allowed_file_type('bracket.sldprt'))"
True
```

No FastAPI import anywhere in `file_types.py`, and none needed — this
real function runs correctly from a bare `python -c` one-liner, with no
real server, no real request, and no real database anywhere in sight.

Wired into a real, first, separate route module:

```python
# src/api/files.py
from fastapi import APIRouter, HTTPException

from src.domain.file_types import is_allowed_file_type

router = APIRouter()


@router.get("/api/files/check")
def check_file_type(filename: str):
    try:
        allowed = is_allowed_file_type(filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"filename": filename, "allowed": allowed}
```

```python
# src/main.py (extended)
from src.api.files import router as files_router

app.include_router(files_router)
```

```
$ curl "http://127.0.0.1:8000/api/files/check?filename=bracket.sldprt"
{"filename":"bracket.sldprt","allowed":true}
$ curl -i "http://127.0.0.1:8000/api/files/check?filename="
HTTP/1.1 400 Bad Request

{"detail":"filename must not be empty"}
```

The real, correct division of labor, proven directly: `is_allowed_
file_type` raises a real, plain, framework-agnostic `ValueError` —
`check_file_type`, the real API-layer route, is the *only* place a
real `HTTPException` — and the real, HTTP-specific idea of a `400`
status code — ever gets created.

### Discard

Nothing throwaway — `file_types.py`, `files.py`, and the real,
extended `main.py` are all permanent.

### Mechanical Walkthrough

- `raise ValueError("filename must not be empty")` — **(c) already
  basic**, Python's own real, standard exception type, raised here on
  purpose as the real, deliberate boundary between domain and API.
- `router = APIRouter()` / `@router.get("/api/files/check")` — **(a)
  first appearance**, full treatment above.
- `try: allowed = is_allowed_file_type(filename) except ValueError as
  e: raise HTTPException(status_code=400, detail=str(e))` — **(b) hard
  concept reappearing** for `HTTPException` (`sqlite-mastery` Lesson
  35); the real, deliberate `try`/`except` translation itself — **(a)
  first appearance** of this specific real pattern: catching a
  framework-agnostic real exception and converting it into a real,
  HTTP-specific one, at the API layer, and nowhere else.
- `app.include_router(files_router)` — **(a) first appearance**, full
  treatment above.

### CS Lens

`ValueError`, raised by the domain layer and translated by the API
layer, is a real, direct instance of the **adapter pattern** — the
domain layer speaks its own, real, plain-Python language; the API
layer *adapts* that language into HTTP's own real vocabulary
(status codes, JSON error bodies), rather than forcing the domain layer
to speak HTTP natively. (This repo's own shared
[`adapter-pattern.md`](../../concepts/adapter-pattern.md) concept file
covers this same real idea in full, general depth.)

### SE Lens

The real, deliberate cost of this extra `try`/`except` step, stated
honestly: one real, small translation block, in exactly one place, per
route. The real payoff, proven directly above: `is_allowed_file_type`
ran correctly from a bare `python -c` command, with zero real
dependency on FastAPI at all — real, direct, provable evidence the
domain layer is genuinely independent, not independent "in spirit"
only.

## Concept Unit: The Real Cost of Breaking the Rule

### The Problem

Nothing in Python itself stops a real domain function from importing
FastAPI directly. What, concretely, breaks if this project's own rule
is quietly ignored?

### Introduce the Concept in Isolation

The real, tempting shortcut — skip the translation step, raise the real
HTTP exception directly from the domain layer:

```python
# src/domain/file_types.py — a real, deliberate violation
from fastapi import HTTPException


def is_allowed_file_type(filename: str) -> bool:
    if not filename:
        raise HTTPException(status_code=400, detail="filename must not be empty")
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)
```

This still runs, and `check_file_type`'s own route (now with its own
`try`/`except` removed, since it's "unnecessary") still returns the
identical real `400` response — the real, dangerous part of this
mistake is that nothing about it looks broken yet. The real, concrete
cost surfaces the moment this exact, real function is reused from
anywhere that isn't a FastAPI route — a real, plausible, future case
this project will actually hit (Phase 3's own file-tree sync, run from
a real background task, not a live HTTP request):

```python
# scripts/validate_import.py — a real, separate, non-HTTP caller
from src.domain.file_types import is_allowed_file_type

for name in ["", "drawing.pdf"]:
    try:
        print(name, is_allowed_file_type(name))
    except Exception as e:
        print(f"rejected: {e.status_code} {e.detail}")
```

```
$ python scripts/validate_import.py
rejected: 400 filename must not be empty
drawing.pdf True
```

A real, genuinely nonsensical value — `e.status_code`, a real HTTP
status code, `400`, printed by a plain, real Python script that never
made an HTTP request, never has an HTTP response to send, and has no
real use for that number at all. This is the real, concrete, provable
cost Lesson 01's own rule exists to prevent: not a crash, but a real
concept (an HTTP status code) leaking into a context that has no real
relationship to HTTP whatsoever, because the domain layer was allowed
to assume every one of its own real callers would always be a live web
request.

### Discard

This real, deliberate violation and `scripts/validate_import.py` are
both disposable — `file_types.py` is restored to its own, real,
correct, `ValueError`-raising form from this unit's own first Concept
Unit; the violation itself never becomes permanent, real project code.

### Mechanical Walkthrough

- `from fastapi import HTTPException` inside `src/domain/file_types.py`
  — **(c) already basic** as a Python `import` statement; its real
  *location* — inside the domain layer — is this entire unit's own
  point, not new syntax.
- `except Exception as e: print(f"rejected: {e.status_code}
  {e.detail}")` — **(b) hard concept reappearing**, ordinary Python
  exception handling; `e.status_code`/`e.detail` — **(b) hard concept
  reappearing**, `HTTPException`'s own real, already-explained
  attributes, read here from a real context where neither one means
  anything at all.

### CS Lens

This is a real, direct, provable instance of a **leaky abstraction**:
a layer boundary that looks intact (the code compiles, the happy path
even runs correctly) while a real, concrete detail from *underneath*
the boundary (an HTTP status code) escapes through it into a context
that never should have needed to know it existed.

### SE Lens

The real, honest reason this matters specifically for this project, not
as abstract hygiene: Phase 3's own real file-tree sync, and Phase 4's
own real checkout logic, both need to run correctly whether they were
triggered by a live, real HTTP request or by a real, backend-internal
process with no HTTP request involved at all. A domain layer that
silently assumed "there's always a real HTTP response to shape" the
way this unit's own deliberate violation did would need a real,
second, awkward rewrite the moment this project's own real, later
lessons actually exercise that assumption — the concrete, provable
reason this rule is enforced starting now, in Lesson 02, rather than
discovered the hard way in Phase 3.

## Connect the pieces

One real, pure domain function, `is_allowed_file_type`, proved Lesson
01's own rule works exactly as claimed: real, correct, and runnable
with zero FastAPI dependency at all, its own real `ValueError`
translated into a real `HTTPException` at exactly one place, the API
layer. A real, deliberate violation of that same rule then proved,
concretely, what the rule protects against — not a crash, but a real,
nonsensical HTTP status code leaking into `scripts/validate_import.py`,
a context that was never a real HTTP request at all.

## What breaks without this

Not applicable beyond this lesson's own second unit — its own real,
deliberate violation and the real, nonsensical `e.status_code` it
produced *is* this lesson's own "what breaks" proof, run directly
rather than described.

## Exercises

1. Add a real, second domain function, `normalize_filename(filename:
   str) -> str` (stripping real, leading/trailing whitespace, lower-
   casing the real extension), following this lesson's own exact
   pattern — a real, pure function, a real `ValueError` for invalid
   input, wired through a real route with its own real `try`/`except`
   translation.
2. Write a real, plain `pytest` test file for `is_allowed_file_type`
   directly (`tests/test_file_types.py`), importing nothing from
   FastAPI at all — confirm it runs correctly with a bare `pytest`
   invocation, direct, provable proof of this lesson's own real claim.

## Definition of Done

- [ ] You wrote a real, pure domain function with zero FastAPI
      dependency, confirmed by running it from a bare `python -c`
      command.
- [ ] You wired it through a real API route with a real
      `ValueError`-to-`HTTPException` translation.
- [ ] You reproduced this lesson's own real, deliberate rule violation
      and observed the real, nonsensical `status_code` it leaked into a
      non-HTTP context.
- [ ] You completed both exercises.

## Next

[Lesson 03 — SQLite and the Data Layer](lesson-03-sqlite-and-the-data-layer.md)
gives `src/data/` its own real, first content — reusing `sqlite-
mastery`'s own repository pattern directly, rather than re-deriving it.
