# Lesson 32: `GET` Endpoints

**What you will build:** `GET /parts` — this arc's own real, primary
listing endpoint, returning every real row in `parts`, and a real,
optional `?min_price=` filter layered directly on top of it.

**What you need to know first:** [Lesson 31](lesson-31-a-real-database-dependency.md)
— `Depends(get_db)`, reused unchanged by this lesson's own new
endpoint. [Lesson 04](lesson-04-select-where-order-by-limit.md) —
`WHERE price > ...`, the real SQL this lesson's own optional filter
wires directly to a real HTTP query parameter.

**Terms introduced in this lesson:**
- **Query parameter** — a real, optional part of a URL, after a `?`
  (`?min_price=10`), distinct from a path parameter (Lesson 31): not
  part of *which* endpoint is matched, only extra, optional data
  supplied to it.

**Objects and methods used:** none new — this lesson combines
already-explained FastAPI (`Depends`, `response_model`, real function
parameters) and SQL (`SELECT`, `WHERE`) into one real endpoint; no new
object or method is introduced.

---

## Concept Unit: Listing Every Real Row

### The Problem

Lesson 31's own `read_part` answers "one specific part, by name."
Arc 5's own real UI needs the opposite, more fundamental real question
first: "every part, all at once" — the exact data a real table on
screen would show.

### Introduce the Concept in Isolation

First, `PartOut` (Lesson 30) gets two real fields it was missing,
matching Lesson 24's own real schema migration:

```python
class PartOut(BaseModel):
    id: int
    name: str
    price: float
    quantity: int
    supplier_id: int | None = None
    notes: str | None = None
    reorder_threshold: int
```

A real, new endpoint:

```python
@app.get("/parts", response_model=list[PartOut])
def list_parts(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM parts").fetchall()
    return [dict(row) for row in rows]
```

```
$ curl http://127.0.0.1:8000/parts
[{"id":1,"name":"Hammer","price":12.99,"quantity":4,"supplier_id":1,"notes":null,"reorder_threshold":5}, ...]
```

Every real row in `parts` — currently a dozen or so, across every
lesson's own additions since Lesson 03 — returned as one real JSON
array. `response_model=list[PartOut]` (not just `PartOut`, Lesson 30's
own single-item form) tells FastAPI the real response is a real *list*
of that shape; each dict in the real list comprehension is validated
and shaped against `PartOut` independently, the identical real
mechanism Lesson 30 already proved for one item, now applied per-item
across a whole collection.

### Discard

Nothing throwaway — `list_parts` is a real, permanent endpoint, and
`PartOut`'s own corrected shape is used by every later endpoint in this
arc.

### Mechanical Walkthrough

- `@app.get("/parts", response_model=list[PartOut])` — **(a) first
  appearance** of `list[PartOut]` as a real, parameterized response
  shape; `@app.get` and `response_model` alone — **(b) hard concept
  reappearing**, both already explained.
- `rows = db.execute("SELECT * FROM parts").fetchall()` — **(b) hard
  concept reappearing**, Lesson 17's own `execute`/`fetchall`, unchanged.
- `return [dict(row) for row in rows]` — **(a) first appearance** of a
  real Python **list comprehension** applying Lesson 19's own
  `dict(row)` conversion to every real row at once, rather than one at
  a time by hand.

### CS Lens

`list[PartOut]` as a real response shape is direct proof of
**homogeneous collection validation**: not just "this one value has
this shape," but "every element of this collection independently has
this same shape" — the identical underlying idea as a typed array
(`List<Part>` in C#, `Part[]` in TypeScript) enforced at a real runtime
boundary instead of only at compile time.

### SE Lens

The real alternative not chosen: let the frontend (Arc 5) request each
real part individually, by name, using Lesson 31's own endpoint N
times. That alternative has the identical real cost this series has
already named for database-level N+1 queries (Lesson 09's own SE Lens)
— now at the *network* level instead: N real HTTP round trips instead
of one. `GET /parts` answers the real, common "give me everything"
case in a single real request, the same reasoning that already
justified `SELECT *` (Lesson 01) at the SQL level, one layer up.

## Concept Unit: `?min_price=` — an Optional Query Parameter

### The Problem

Arc 5's own real UI needs more than "everything, unconditionally" —
Lesson 04's own original motivating question, "which parts cost more
than $10," needs a real, equivalent HTTP-level way to ask it.

### Introduce the Concept in Isolation

One real, small change to `list_parts`:

```python
@app.get("/parts", response_model=list[PartOut])
def list_parts(db: sqlite3.Connection = Depends(get_db), min_price: float | None = None):
    if min_price is not None:
        rows = db.execute("SELECT * FROM parts WHERE price > ?", (min_price,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM parts").fetchall()
    return [dict(row) for row in rows]
```

```
$ curl "http://127.0.0.1:8000/parts?min_price=10"
[{"id":1,"name":"Hammer","price":12.99, ...}, {"id":3,"name":"Drill","price":45.0, ...}, ...]
```

```
$ curl http://127.0.0.1:8000/parts
[{"id":1,"name":"Hammer", ...}, {"id":2,"name":"Wrench", ...}, ...]
```

The first real request, with `?min_price=10` in the URL, returns only
the real, correct subset — Lesson 04's own original `WHERE price > 10`
question, now reachable over real HTTP. The second, with no query
string at all, returns every row — `min_price`'s own real default,
`None`, correctly took the `else` branch. `min_price`'s presence in
`list_parts`'s own signature, with no `Depends(...)` and no path
placeholder naming it, is exactly what tells FastAPI to read it from
the real URL's own query string instead.

### Discard

Nothing throwaway — `min_price` is a real, permanent, optional
capability of `GET /parts` from here on.

### Mechanical Walkthrough

- `min_price: float | None = None` — **(a) first appearance** of a
  real FastAPI query parameter: a plain function parameter, not
  matched to any path placeholder, with a real default value — the
  real signal FastAPI uses to read it from `?min_price=...` rather than
  requiring it in the path or a request body.
- `if min_price is not None: ... else: ...` — **(c) already basic**,
  ordinary Python conditional logic.
- `db.execute("SELECT * FROM parts WHERE price > ?", (min_price,))` —
  **(b) hard concept reappearing**, Lesson 18's own `?` parameterization,
  unchanged — `min_price`, real, external, HTTP-supplied data, is bound
  safely, never concatenated into the SQL string.

### CS Lens

A query parameter with a real default is this arc's own concrete
instance of an **optional parameter with a sentinel default** —
`None` here signals "not provided" in a way a real, valid `float`
(including a real `0.0`) never could, letting `list_parts` distinguish
"no filter requested" from "filter requested at the value zero,"
correctly, every time.

### SE Lens

Wiring `min_price` directly into a parameterized `WHERE` clause,
exactly as done here, is the real, correct pattern this arc commits to
for every future filterable endpoint — reusing Lesson 18's own safe
form rather than ever reintroducing string concatenation now that real,
external HTTP input is involved for the first time in this arc's own
SQL. This is the real, concrete case Lesson 18's own SE Lens already
promised: "every dynamic query in this project's own Arc 4 backend...
uses this exact `?`-placeholder form, unconditionally" — `min_price`
is the first real proof of that promise being kept.

## Connect the pieces

One real endpoint, `GET /parts`, grew in two real steps: first,
returning every real row as one JSON array, `response_model=
list[PartOut]` validating the whole real collection at once; then, a
real, optional `?min_price=` query parameter, wired through Lesson 18's
own safe parameterized `WHERE`, reusing Lesson 04's own original
motivating SQL question — now reachable, correctly and safely, over
real HTTP for the first time.

## What breaks without this

Send a real, non-numeric value for `min_price`:

```
$ curl -i "http://127.0.0.1:8000/parts?min_price=cheap"
HTTP/1.1 422 Unprocessable Entity

{"detail":[{"type":"float_parsing","loc":["query","min_price"],"msg":"Input should be a valid number, unable to parse string as a number","input":"cheap"}]}
```

The identical real validation failure shape Lesson 30 already proved
for a request *body* field — `"loc":["query","min_price"]` instead of
`"loc":["body","price"]` — confirming FastAPI applies the exact same
real type-checking machinery to query parameters as it does to request
bodies, with `list_parts`'s own body never running at all, exactly like
Lesson 30's own `create_part` didn't.

## Exercises

1. Add a second real, optional query parameter, `supplier_id: int |
   None = None`, filtering `parts` by supplier when provided. Confirm
   it can be combined with `min_price` in the same real request
   (`?min_price=10&supplier_id=1`) and correctly applies both real
   conditions together.
2. Add a real `in_stock_only: bool = False` query parameter, filtering
   to `quantity > 0` when `true`. Research and confirm which real,
   literal query-string values (`?in_stock_only=true`,
   `?in_stock_only=1`) FastAPI correctly parses as real Python `True`.

## Definition of Done

- [ ] You listed every real `parts` row through `GET /parts`.
- [ ] You added `?min_price=` and confirmed it reuses Lesson 04's own
      original `WHERE price > 10` question, correctly, over real HTTP.
- [ ] You caused the real `422` from a non-numeric `min_price` and
      confirmed its `loc` correctly names `"query"`, not `"body"`.
- [ ] You completed both exercises.

## Next

[Lesson 33 — `POST`/`PUT`/`DELETE` Endpoints](lesson-33-post-put-delete-endpoints.md)
gives this arc full, real CRUD — writing, updating, and removing real
`parts` rows over HTTP, not just reading them.
