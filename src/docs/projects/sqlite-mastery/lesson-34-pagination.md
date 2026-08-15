# Lesson 34: Pagination

**What you will build:** `GET /parts` given a real, bounded page size —
`limit`/`offset` query parameters wired directly to Lesson 04's own SQL
`LIMIT`/`OFFSET`, plus a real, honest total-count header so a real
client knows how many rows exist beyond whatever page it just received.

**What you need to know first:** [Lesson 04](lesson-04-select-where-order-by-limit.md)
— `LIMIT`/`OFFSET`'s own real SQL mechanics, wired here to real HTTP
query parameters for the first time. [Lesson 32](lesson-32-get-endpoints.md)
— `GET /parts`'s own current, real shape, extended in this lesson.

**Terms introduced in this lesson:** none new — this lesson wires
already-explained SQL (`LIMIT`/`OFFSET`) and FastAPI (query parameters)
together; no new concept is introduced.

**Objects and methods used:**

**`fastapi.Response` (as a real handler parameter)**
- *What it is:* a real, built-in FastAPI/Starlette object representing
  the outgoing HTTP response.
- *Implementation:* declared as a real parameter (`response: Response`)
  on an endpoint function, FastAPI supplies the real, live response
  object being built — `response.headers["Name"] = "value"` sets a
  real, custom HTTP header on it, in addition to the function's own
  normal, returned body.
- *Its use:* attaching a real `X-Total-Count` header to `GET /parts`'s
  own response.

---

## Concept Unit: `limit`/`offset` — Bounding a Real Response

### The Problem

Every real request to `GET /parts` so far has returned this project's
*entire* table — a real, growing dozen-plus rows today, and, per
Lesson 04's own SE Lens (first stated about SQL, equally true over
HTTP), a genuinely damaging amount of real, unwanted data the moment
this table holds thousands.

### Introduce the Concept in Isolation

```python
@app.get("/parts", response_model=list[PartOut])
def list_parts(
    db: sqlite3.Connection = Depends(get_db),
    min_price: float | None = None,
    limit: int = 20,
    offset: int = 0,
):
    where = "WHERE price > ?" if min_price is not None else ""
    params = (min_price,) if min_price is not None else ()
    rows = db.execute(
        f"SELECT * FROM parts {where} ORDER BY id LIMIT ? OFFSET ?",
        params + (limit, offset),
    ).fetchall()
    return [dict(row) for row in rows]
```

```
$ curl "http://127.0.0.1:8000/parts?limit=2&offset=0"
[{"id":1,"name":"Hammer", ...},{"id":2,"name":"Wrench", ...}]
```

```
$ curl "http://127.0.0.1:8000/parts?limit=2&offset=2"
[{"id":3,"name":"Drill", ...},{"id":4,"name":"Tape Measure", ...}]
```

Two real, disjoint pages, together covering exactly `parts`' own first
four rows in real `id` order — Lesson 04's own `LIMIT`/`OFFSET` pattern
proven, unchanged, now reachable over real HTTP. `limit`'s own real
default, `20`, means an ordinary `GET /parts` with no query string at
all still returns a real, bounded response rather than reverting to
Lesson 32's own original, unbounded behavior.

### Discard

Nothing throwaway — real, permanent pagination, extended in Lesson 40's
own DataTables integration directly.

### Mechanical Walkthrough

- `limit: int = 20, offset: int = 0` — **(b) hard concept reappearing**,
  Lesson 32's own real query-parameter shape (`min_price`), applied to
  two new, real names with real, sensible defaults.
- `where = "WHERE price > ?" if min_price is not None else ""` — **(a)
  first appearance** of building a real SQL query's own *shape* (whether
  a clause is present at all) from a real, fixed choice between two
  literal strings — **worth naming explicitly as distinct from Lesson
  18's own real danger**: no real, external *value* is spliced into the
  SQL text here, only a choice between two hardcoded fragments; every
  real value (`min_price`, `limit`, `offset`) still travels through a
  real `?` placeholder, exactly as Lesson 18 requires.
- `f"SELECT * FROM parts {where} ORDER BY id LIMIT ? OFFSET ?"` — **(b)
  hard concept reappearing** for `ORDER BY`/`LIMIT`/`OFFSET`, Lesson
  04's own shape, unchanged; the f-string itself — **(c) already
  basic**, ordinary Python string interpolation, used here only to
  insert the *safe*, fixed `where` fragment from above.
- `params + (limit, offset)` — **(a) first appearance** of real Python
  tuple concatenation, building the full, correctly-ordered parameter
  tuple to match the SQL string's own three or two real `?`
  placeholders, depending on whether `min_price` was supplied.

### CS Lens

`ORDER BY id` — new in this exact line, not called out separately above
since it reuses Lesson 04's own already-explained syntax directly — is
real, load-bearing here in a way it wasn't always in earlier lessons:
Lesson 04 itself already proved a result set's order is never
guaranteed without one, and **pagination specifically depends on that
order staying stable between requests** — two real, separate `LIMIT
2 OFFSET 2` calls, run against a table not concurrently changing,
must return the same real slice both times, or "page 2" stops meaning
anything consistent.

### SE Lens

The real, honest limitation this lesson leaves open, worth naming
directly rather than implying pagination is now fully solved: `OFFSET`
based pagination, exactly as built here, genuinely gets slower as
`offset` grows on a large real table — SQLite still has to walk past
every skipped row internally, even though it discards them before
returning any. A real, more scalable alternative — **keyset
pagination** (paginating by "give me rows with `id` greater than the
last one I saw," instead of counting through a real `OFFSET`) — is a
real, legitimate future improvement this project doesn't need yet at
its own current real scale, named honestly here rather than silently
assumed solved.

## Concept Unit: `X-Total-Count` — Telling the Caller How Many Rows Exist

### The Problem

A real client showing "page 2 of `parts`" has no real way, from
`limit`/`offset` alone, to know whether a page 3 exists at all, or how
many total real rows this filtered query matches.

### Introduce the Concept in Isolation

```python
from fastapi import Response


@app.get("/parts", response_model=list[PartOut])
def list_parts(
    response: Response,
    db: sqlite3.Connection = Depends(get_db),
    min_price: float | None = None,
    limit: int = 20,
    offset: int = 0,
):
    where = "WHERE price > ?" if min_price is not None else ""
    params = (min_price,) if min_price is not None else ()
    total = db.execute(f"SELECT COUNT(*) FROM parts {where}", params).fetchone()[0]
    rows = db.execute(
        f"SELECT * FROM parts {where} ORDER BY id LIMIT ? OFFSET ?",
        params + (limit, offset),
    ).fetchall()
    response.headers["X-Total-Count"] = str(total)
    return [dict(row) for row in rows]
```

```
$ curl -i "http://127.0.0.1:8000/parts?limit=2&offset=0" | head -20
HTTP/1.1 200 OK
x-total-count: 14
content-type: application/json

[{"id":1,"name":"Hammer", ...},{"id":2,"name":"Wrench", ...}]
```

A real, custom HTTP header, `x-total-count`, alongside the real, still-
two-row body — `COUNT(*)` (Lesson 10's own real aggregate) applied to
the identical real `WHERE` clause the page itself uses, so the reported
total always genuinely matches whatever real filter is active, not the
table's own unfiltered size.

### Discard

Nothing throwaway — `X-Total-Count` is a real, permanent part of every
future `GET /parts` response, reused directly by Arc 5's own DataTables
integration (Lesson 40), which needs exactly this real number to render
its own "showing 1 to 20 of N entries" footer correctly.

### Mechanical Walkthrough

- `response: Response` — **(a) first appearance**, full treatment
  above; declared as a real parameter with no default and no
  `Depends(...)` — FastAPI recognizes the real `Response` type itself as
  a special case, supplying the live response object automatically.
- `total = db.execute(f"SELECT COUNT(*) FROM parts {where}",
  params).fetchone()[0]` — **(b) hard concept reappearing** for
  `COUNT(*)` (Lesson 10) and the same safe `where`/`params` pattern
  from this lesson's own first unit; `.fetchone()[0]` — **(b) hard
  concept reappearing**, Lesson 17's own tuple-position access, a
  deliberate, correct use here since `COUNT(*)` always returns exactly
  one row, one column.
- `response.headers["X-Total-Count"] = str(total)` — **(a) first
  appearance**, full treatment above; `str(total)` — **(c) already
  basic**, HTTP headers are always real text, never a raw integer.

### CS Lens

Returning real metadata (`X-Total-Count`) *alongside* real data (the
JSON body), rather than folding it into the body itself, is a real,
deliberate application of **separation of concerns** at the HTTP level:
the response body stays a clean, homogeneous `list[PartOut]` — exactly
what `response_model` already promises — while metadata about that list
travels through HTTP's own real, purpose-built channel for it, headers.

### SE Lens

The real alternative not chosen: wrap every list response in an
envelope object, `{"total": 14, "items": [...]}`, instead of a bare
JSON array. That alternative is real and common elsewhere; the real
tradeoff against it here: it would break `response_model=list[PartOut]`'s
own clean, direct shape, and every real client would need to unwrap one
extra layer for what's usually the only part it actually wants. Headers
keep the body's own real shape simple while still making the real total
available to any client that asks for it.

## Connect the pieces

`GET /parts` now returns a real, bounded page — `limit`/`offset`
wired directly to Lesson 04's own SQL, safely, with only the query's
own *shape* (not any real value) ever touching an f-string — and a real
`X-Total-Count` header, computed from the identical `WHERE` clause the
page itself uses, giving any real caller everything needed to build a
correct, real "page N of M" experience.

## What breaks without this

Request a real `offset` far past the end of the real table:

```
$ curl -i "http://127.0.0.1:8000/parts?limit=20&offset=9999"
HTTP/1.1 200 OK
x-total-count: 14

[]
```

A real, empty array — not an error. This is the correct, honest real
behavior: `LIMIT`/`OFFSET` (Lesson 04) never treats "past the end" as a
failure, only as "nothing left to return," and `x-total-count: 14`
still correctly tells a real caller exactly how far past the end this
particular request went, rather than leaving it to guess.

## Exercises

1. Confirm `limit`/`offset` and `min_price` compose correctly together
   in one real request — request a filtered, paginated page and confirm
   both the real returned rows and `X-Total-Count` reflect the filter,
   not the whole table.
2. Add a real, minimum enforced bound to `limit` (reject or clamp any
   real request for more than, say, `100` rows at once) — research a
   real way to express this directly in FastAPI's own parameter
   declaration (a real `Query(le=100)` constraint) rather than an
   explicit `if` check inside the function body.

## Definition of Done

- [ ] You paginated `GET /parts` with real `limit`/`offset` values and
      confirmed two real, disjoint pages.
- [ ] You confirmed `X-Total-Count` reports the real, correct total for
      both a filtered and an unfiltered request.
- [ ] You requested a real, past-the-end `offset` and confirmed an
      honest empty result rather than an error.
- [ ] You completed both exercises.

## Next

[Lesson 35 — Error Handling and HTTP Status Codes](lesson-35-error-handling-and-http-status-codes.md)
finally closes Lesson 33's own real, broken "update a nonexistent id"
gap, and gives this arc's own errors a real, honest, consistent shape.
