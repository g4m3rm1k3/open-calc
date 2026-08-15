# Lesson 35: Error Handling and HTTP Status Codes

**What you will build:** a real, honest `404` for a part that genuinely
doesn't exist — closing Lesson 33's own real, broken all-`null`
response — and direct, run proof of what FastAPI does, by default, when
a real bug causes an endpoint to fail in a way nobody explicitly
handled.

**What you need to know first:** [Lesson 33](lesson-33-post-put-delete-endpoints.md)
— its own closing section left a real, deliberately unfixed gap; this
lesson closes it. [Lesson 29](lesson-29-fastapi-project-setup-and-the-first-endpoint.md)
— the real `404` FastAPI already returns automatically for an unmatched
*route*; this lesson's own subject is different: a matched route whose
requested *resource* doesn't exist.

**Terms introduced in this lesson:**
- **HTTP status code** — a real, standard three-digit number every HTTP
  response includes, categorizing the real outcome: `2xx` real success,
  `4xx` a real problem with the request, `5xx` a real problem on the
  server's own side.

**Objects and methods used:**

**`fastapi.HTTPException`**
- *What it is:* a real, built-in FastAPI exception class.
- *Implementation:* `raise HTTPException(status_code=404, detail="...")`
  — FastAPI catches this specific exception type automatically and
  converts it into a real HTTP response with the given status code and
  a real `{"detail": "..."}` JSON body — the handler function itself
  never returns normally.
- *Its use:* the real, correct way to signal "this specific request is
  invalid" from inside an endpoint, without an unhandled Python
  exception.

---

## Concept Unit: `404` — a Real, Honest "Not Found"

### The Problem

Lesson 33's own closing section proved `PUT /parts/99999` — a real,
syntactically valid request, naming an `id` that simply doesn't exist —
produces a genuinely broken, all-`null` `200 OK` response instead of an
honest failure.

### Introduce the Concept in Isolation

```python
from fastapi import HTTPException


@app.get("/parts/id/{part_id}", response_model=PartOut)
def read_part_by_id(part_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")
    return dict(row)
```

```
$ curl -i http://127.0.0.1:8000/parts/id/99999
HTTP/1.1 404 Not Found

{"detail":"Part 99999 not found"}
```

A real, honest response — the exact real status code (`404`) Lesson 29
already proved FastAPI returns automatically for an unmatched *route*,
now used deliberately for a matched route whose *resource* doesn't
exist, with a real, specific message naming exactly which `id` was
missing.

The identical real fix, applied to Lesson 33's own broken endpoints:

```python
@app.put("/parts/{part_id}", response_model=PartOut)
def update_part(part_id: int, part: PartCreate, db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute("SELECT id FROM parts WHERE id = ?", (part_id,)).fetchone()
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Part {part_id} not found")
    with db:
        db.execute(
            "UPDATE parts SET name = ?, price = ?, quantity = ?, supplier_id = ? WHERE id = ?",
            (part.name, part.price, part.quantity, part.supplier_id, part_id),
        )
    row = db.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
    return dict(row)
```

```
$ curl -i -X PUT http://127.0.0.1:8000/parts/99999 \
    -H "Content-Type: application/json" \
    -d '{"name": "Ghost", "price": 1.0, "quantity": 1}'
HTTP/1.1 404 Not Found

{"detail":"Part 99999 not found"}
```

Lesson 33's own real, broken all-`null` response is gone — replaced
with the identical, real, honest `404` this unit's own first endpoint
already proved.

### Discard

Nothing throwaway — every real endpoint reading or modifying a specific
part by `id`, across this entire arc, now checks for existence first
and raises this exact real `HTTPException` when it's missing.

### Mechanical Walkthrough

- `from fastapi import HTTPException` — **(a) first appearance**,
  importing this lesson's own real subject.
- `if row is None: raise HTTPException(status_code=404, detail=f"Part
  {part_id} not found")` — **(a) first appearance** of `HTTPException`,
  full treatment above; `f"Part {part_id} not found"` — **(c) already
  basic**, ordinary Python f-string interpolation.
- `existing = db.execute("SELECT id FROM parts WHERE id = ?",
  (part_id,)).fetchone()` — **(b) hard concept reappearing**, an
  ordinary parameterized `SELECT`; selecting only `id` rather than `*`
  — **(c) already basic**, Lesson 02's own column-list `SELECT`, chosen
  here since only existence, not the row's full content, needs
  checking.

### CS Lens

`HTTPException` is a real, structured instance of **exceptions as
control flow for expected failure cases** — "this specific `id` might
not exist" is a real, anticipated condition, not a bug, and raising a
real, typed exception FastAPI itself knows how to translate into a
correct HTTP response is the idiomatic way to express that, rather than
returning a real, ambiguous sentinel value (this lesson's own Lesson
33 precedent: a broken, all-`null` object) that calling code has to
remember to check for by convention.

### SE Lens

The real, honest cost of this fix: every endpoint touching one specific
real row by `id` now needs its own real existence check, repeated
across `read_part_by_id`, `update_part`, and (an exercise, below)
`delete_part`'s own real equivalent — a real, small amount of
repetition this arc accepts rather than building a further abstraction
for, since three real call sites is not yet the genuine duplication
problem Lesson 22's own repository pattern was built to solve; a fourth
or fifth real occurrence would be the honest signal to reconsider.

## Concept Unit: `500` — What Happens When Nobody Handles It

### The Problem

`404` is a real, deliberate, anticipated failure. What does this arc's
own server do about a genuinely unanticipated one — a real bug, not a
missing row?

### Introduce the Concept in Isolation

A real, deliberately broken endpoint, added only to observe FastAPI's
own real default behavior:

```python
@app.get("/broken")
def broken_endpoint():
    return 1 / 0
```

```
$ curl -i http://127.0.0.1:8000/broken
HTTP/1.1 500 Internal Server Error

{"detail":"Internal Server Error"}
```

A real `500` status — and a deliberately vague real message, `"Internal
Server Error"`, revealing nothing about the actual real cause
(`ZeroDivisionError`) to the caller. The real, full Python traceback,
by contrast, is printed to this arc's own real server console (visible
in the same terminal `uvicorn` is running in) — genuinely useful for
real debugging, but never sent to the real, external caller.

### Discard

`broken_endpoint` is real, disposable proof of FastAPI's own default
behavior — removed once observed, never a real, permanent part of this
project.

### Mechanical Walkthrough

- `return 1 / 0` — **(c) already basic**, ordinary Python; `1 / 0`
  raises a real, genuine `ZeroDivisionError`, chosen here purely as a
  reliable, deliberate way to trigger an unhandled real exception.
- The real `500` response itself — not code this lesson wrote; FastAPI's
  own default exception handler produced it automatically, the real
  point of this unit.

### CS Lens

FastAPI's own real, default behavior here is **fail-safe error
handling**: an unanticipated failure is caught at a real, outer
boundary (FastAPI's own request-handling loop) rather than crashing the
entire server process or, worse, leaking real internal detail (a stack
trace, a file path, a variable's real value) to an untrusted, external
caller.

Also recognized in: a language runtime's own top-level exception
handler preventing one bad request from crashing an entire real
process, a production web server logging a real error internally while
showing visitors a generic "something went wrong" page, defensive
programming generally treating "the unexpected happened" as a real
category to plan for, not an impossibility to ignore.

### SE Lens

The real, deliberate tradeoff: hiding the real cause from the external
response is correct default behavior for a real, production-facing
API — a real stack trace can leak genuinely sensitive internal detail
(file paths, library versions, occasionally real data) to anyone who
can trigger the failure. The real cost: without checking the real
server console (or a real, proper logging setup, beyond this lesson's
own scope), a caller — and, during development, the very person who
just broke something — gets no real information at all beyond "500."
This is exactly why `404`s (this lesson's own first unit) are
deliberately, explicitly raised with a real, specific, safe message —
reserving the vague, generic `500` exclusively for the real cases
nobody anticipated.

## Connect the pieces

Two real, distinct failure categories, given two real, honest shapes:
`404`, deliberately raised via `HTTPException` the instant a real
lookup by `id` finds nothing, closing Lesson 33's own genuinely broken
gap with a real, specific message; and `500`, FastAPI's own automatic,
deliberately vague fallback for a real, unanticipated bug, proven
directly with a real `1 / 0` — safe for an external caller, while the
real, full detail stays visible only in this arc's own server console.

## What breaks without this

Compare this lesson's own real `404` against Lesson 33's own real,
still-broken `delete_part` (an exercise below fixes it) — request
`DELETE` against a nonexistent `id` before applying the same real fix:

```
$ curl -i -X DELETE http://127.0.0.1:8000/parts/99999
HTTP/1.1 204 No Content
```

A real `204` — technically honest, per Lesson 33's own real SE Lens
(`DELETE`'s own idempotent semantics never treat "matched nothing" as
failure) — but a real, genuine design question worth naming directly:
should "delete something that was never there" report success, the way
raw SQL's own `DELETE` semantics do, or should it report `404`, the way
this lesson's own `GET`/`PUT` fix now does? Both are real, defensible
API designs; this series' own choice, applied consistently in the
exercise below, is `404` — treating "nothing to delete" as worth
telling the caller about explicitly, rather than silently agreeing with
SQL's own more permissive default.

## Exercises

1. Apply this lesson's own real `404` fix to `delete_part`, and decide,
   explicitly, which of the two real designs discussed above this
   project should use — then implement it and confirm your own choice
   with a real request against a nonexistent `id`.
2. Reproduce this lesson's own real `500` proof yourself with a
   *different* deliberate bug (a real, uncaught `KeyError` or
   `AttributeError`, not `ZeroDivisionError`), and confirm the real,
   external response is identically vague regardless of which specific
   real exception type caused it.

## Definition of Done

- [ ] You closed Lesson 33's own real, broken `PUT`-against-a-missing-
      `id` gap with a real, honest `404`.
- [ ] You caused a real, deliberate `500` and confirmed the real,
      external response reveals nothing while the real server console
      shows the full traceback.
- [ ] You completed both exercises.

## Next

[Lesson 36 — CORS](lesson-36-cors.md) closes this arc with the real,
final piece needed before a genuine browser page — Arc 5's own real UI
— can call any of this arc's own endpoints at all.
