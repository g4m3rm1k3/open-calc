# Lesson 31: A Real Database Dependency

**What you will build:** this arc's own first endpoint that actually
reads `pocket_hardware.db` — a real connection, opened fresh per
request and closed automatically afterward, using FastAPI's own real
dependency-injection mechanism instead of hand-written setup code
repeated in every handler.

**What you need to know first:** [Lesson 22](lesson-22-a-repository-pattern-in-python.md)
— `get_connection`'s own real shape, the direct ancestor of this
lesson's own dependency function. [Lesson 29](lesson-29-fastapi-project-setup-and-the-first-endpoint.md)
— `main.py`'s own real, running server, extended here for the first
time with a real database-backed endpoint.

**Terms introduced in this lesson:**
- **Dependency injection** — a real, general pattern: a function
  declares *what it needs* (here, an open database connection) as a
  parameter, and something else (FastAPI itself) is responsible for
  actually supplying it — the function itself never constructs its own
  dependency directly.
- **Path parameter** — a real, named, variable segment of a URL path
  (`/parts/{name}`), whose real, matched value is passed directly into
  the handler function.

**Objects and methods used:**

**`fastapi.Depends`**
- *What it is:* a real, built-in FastAPI function.
- *Implementation:* used as a parameter's own default value —
  `db: sqlite3.Connection = Depends(get_db)` — telling FastAPI to call
  `get_db` and supply its result as `db`, fresh, for every real
  request this endpoint handles.
- *Its use:* supplying a real, correctly-configured `sqlite3` connection
  to every endpoint in this arc, without each one repeating Lesson 22's
  own setup code by hand.

---

## Concept Unit: `Depends` — a Fresh Connection, Per Request, Automatically Closed

### The Problem

Every real endpoint this arc adds from here needs a real, open
connection to `pocket_hardware.db`, correctly configured (Lesson 19's
own `row_factory = sqlite3.Row`, specifically). Repeating Lesson 17's
own `sqlite3.connect(...)` and Lesson 19's own `row_factory` line
inside every single handler function would be the identical real
duplication problem Lesson 22 already solved once for plain scripts —
does FastAPI have a real, comparable answer for endpoints specifically?

### Introduce the Concept in Isolation

A real, small addition to `main.py`:

```python
import sqlite3
from fastapi import Depends


def get_db():
    conn = sqlite3.connect("pocket_hardware.db")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


@app.get("/parts/{name}")
def read_part(name: str, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM parts WHERE name = ?", (name,)).fetchone()
    return dict(row) if row else {}
```

```
$ curl http://127.0.0.1:8000/parts/Drill
{"id":3,"name":"Drill","price":45.0,"quantity":2,"supplier_id":1,"notes":null,"reorder_threshold":5}
```

A real, correct row — every real column from Lesson 24's own migrated
`parts` schema included, `dict(row)` converting Lesson 19's own real
`sqlite3.Row` into a plain `dict` FastAPI can serialize to JSON. Neither
`get_db` nor `read_part` was called directly by any code in this file —
FastAPI itself, seeing `Depends(get_db)` as `db`'s own default value,
called `get_db()`, ran it up to its own `yield`, handed the yielded
`conn` to `read_part` as `db`, and — once `read_part` finished
returning its own response — resumed `get_db` *after* the `yield`,
running its real `finally: conn.close()` automatically.

### Discard

Nothing throwaway — `get_db` is a real, permanent function, reused as
`Depends(get_db)` in every later endpoint this arc adds.

### Mechanical Walkthrough

- `@app.get("/parts/{name}")` — **(b) hard concept reappearing** for
  `@app.get` itself, Lesson 29's own decorator; `{name}` — **(a) first
  appearance** of a real path parameter, full treatment above.
- `def read_part(name: str, db: sqlite3.Connection = Depends(get_db)):`
  — `name: str` — **(a) first appearance**: FastAPI matches this
  parameter's own name (`name`) against the path's own `{name}`
  placeholder automatically, and validates the real, matched URL
  segment against the declared type (`str`) the same way Lesson 30's
  own `PartCreate` validated a request body. `db: sqlite3.Connection =
  Depends(get_db)` — **(a) first appearance**, full treatment above.
- `def get_db(): conn = sqlite3.connect(...); conn.row_factory = ...;
  try: yield conn; finally: conn.close()` — **(b) hard concept
  reappearing** for `sqlite3.connect`/`row_factory`/`try`/`finally`, all
  already explained (Lessons 17, 19, 22); `yield` inside a `try` block
  used as a real FastAPI dependency — **(a) first appearance** of this
  specific, real pattern: the code *before* `yield` runs before the
  handler; the code *after* it (here, inside `finally`) runs after,
  regardless of whether the handler itself succeeded or raised.
- `dict(row) if row else {}` — **(b) hard concept reappearing**,
  Lesson 19's own real `dict(row)` conversion; the conditional
  expression itself — **(c) already basic**, ordinary Python.

### CS Lens

This is real **dependency injection**, named directly in this lesson's
own Header: `read_part` declares *what it needs* (an open connection)
as a parameter, and never calls `sqlite3.connect` itself — FastAPI, the
real, external framework, is responsible for constructing and supplying
it. `get_db`'s own `yield`-based shape is a real, general pattern
(Python calls a generator function used this way, when driven by code
that supports it, a **context manager function**) for expressing
"setup, then a real usage point, then guaranteed teardown" in one
readable place.

Also recognized in: this series' own [`snake-csharp`](../snake-csharp/)
sibling curriculum, which names dependency injection directly as "the
mechanism behind ASP.NET Core's DI container" — the real, identical
underlying idea, in a different real language and framework; Python's
own `@contextlib.contextmanager` decorator, built on the exact same
yield-once shape; a Java or C# constructor accepting an interface
instead of instantiating a concrete class directly.

### SE Lens

The real alternative not chosen: every endpoint calls
`sqlite3.connect("pocket_hardware.db")` directly inside its own body,
repeating Lesson 19's own `row_factory` line each time. That
alternative has the identical real cost this series has now named three
separate times (Lesson 01's filtering, Lesson 07's constraints, Lesson
22's repository) — N independent, duplicated call sites, each capable
of forgetting a real detail. `Depends(get_db)` centralizes it once,
correctly, and — a real, additional benefit specific to testing — makes
it possible to swap in a genuinely different `get_db` (Lesson 23's own
`:memory:` shared-cache pattern, wired through FastAPI's own real
dependency-override mechanism) for automated tests, without changing a
single endpoint's own code.

## Connect the pieces

One real dependency function, `get_db`, now supplies every real
database connection this arc's endpoints use — proven directly by
`read_part`, this arc's own first endpoint to actually query
`pocket_hardware.db`, correctly returning `Drill`'s real, current row,
with `sqlite3.connect`, `row_factory`, and connection cleanup all
handled once, centrally, rather than repeated inside the handler
itself.

## What breaks without this

Request a real, nonexistent part name:

```
$ curl http://127.0.0.1:8000/parts/Nonexistent
{}
```

A real, empty object — not a crash, and not a real `404`. `db.execute(
...).fetchone()` correctly returned `None` (Lesson 17's own real
`fetchone` behavior when nothing matches), and `read_part`'s own `dict(row)
if row else {}` correctly avoided a real `TypeError` from calling
`dict(None)` — but an empty `{}` is a genuinely poor real response for
"this part doesn't exist," easy to mistake for a real, empty part.
This is direct, honest proof of a real gap this arc hasn't closed yet
— Lesson 35's own dedicated subject, not this one.

## Exercises

1. Add a real, second path-parameter endpoint, `@app.get("/parts/id/
   {part_id}")`, reading `part_id: int` instead of `name: str`, using
   the identical `Depends(get_db)` pattern. Confirm a real, valid `id`
   returns the correct row, and confirm requesting a real, non-integer
   value in that position (`/parts/id/abc`) produces a real,
   automatic `422` — proof path parameters are validated the same real
   way Lesson 30's own request bodies are.
2. Temporarily remove the `try`/`finally` from `get_db`, leaving only
   `conn = sqlite3.connect(...); conn.row_factory = ...; yield conn`
   with no explicit `conn.close()` anywhere. Make several real requests
   in a row, and research (using Python's own real `sqlite3` connection
   behavior) what real, eventual problem — not necessarily visible after
   only a few requests — this omission risks under sustained real
   traffic.

## Definition of Done

- [ ] You added `get_db` and confirmed `Depends(get_db)` supplies a
      real, working connection to `read_part`.
- [ ] You requested a real, existing part by name and got its correct,
      current real row back as JSON.
- [ ] You confirmed a nonexistent part returns an empty `{}` rather
      than crashing, and can explain why that's an honest, if
      incomplete, real result.
- [ ] You completed both exercises.

## Next

[Lesson 32 — `GET` Endpoints](lesson-32-get-endpoints.md) builds this
arc's own real, primary way to list and filter `parts` — every
endpoint so far has answered only "one specific part, by one specific
key."
