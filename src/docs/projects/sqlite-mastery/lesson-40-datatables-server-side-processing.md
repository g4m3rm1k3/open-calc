# Lesson 40: DataTables Server-Side Processing

**What you will build:** a real, dedicated backend endpoint speaking
DataTables' own real server-side protocol directly — every sort,
search, and page change now a real request to Arc 4's own backend,
replacing Lesson 39's own real, honest `?limit=100` ceiling entirely.

**What you need to know first:** [Lesson 39](lesson-39-rendering-the-backends-data-as-a-datatable.md)
— its own SE Lens named this lesson's exact real problem directly.
[Lesson 34](lesson-34-pagination.md) — `LIMIT`/`OFFSET`, reused here as
the real SQL this lesson's own endpoint translates DataTables' own real
request parameters into.

**Terms introduced in this lesson:**
- **Server-side processing** — DataTables' own real, alternative mode:
  instead of fetching every row once (Lesson 39's own real "client-side
  processing"), every real sort, search, and page change sends a real,
  new request to the server, which returns only the one real page of
  rows actually needed.

**Objects and methods used:**

**`fastapi.Request`**
- *What it is:* a real, built-in FastAPI/Starlette object representing
  the real, incoming HTTP request.
- *Implementation:* declared as a real parameter (`request: Request`);
  `request.query_params` gives real, direct access to every real query
  string key, including ones (like DataTables' own `search[value]`)
  that don't map cleanly onto an ordinary, flat FastAPI parameter name.
- *Its use:* reading DataTables' own real, bracket-named parameters
  directly, since FastAPI's normal automatic query-parameter binding
  (Lesson 32) has no built-in way to parse that specific real shape.

---

## Concept Unit: DataTables' Own Real Request Protocol

### The Problem

`serverSide: true`, DataTables' own real setting for this mode, sends a
real, specific set of query parameters on every table interaction — a
sort click, a search keystroke, a page change — and expects a real,
specific response shape back. Lesson 39's own endpoint, `GET /parts`,
understands neither.

### Introduce the Concept in Isolation

Turning on `serverSide` and inspecting the real request DataTables
itself sends (visible directly in any real browser's own Network
developer tool, the moment this setting is enabled):

```
GET /parts/datatable?draw=1&start=0&length=10&search%5Bvalue%5D=&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc
```

URL-decoded, DataTables' own real, standard parameter names: `draw` (a
real counter DataTables increments itself, expected back unchanged, so
it can safely discard a real, late-arriving response to an outdated
request), `start`/`length` (this lesson's own real equivalent of Lesson
34's `offset`/`limit`), `search[value]` (the real, current text in
DataTables' own built-in search box), and `order[0][column]`/
`order[0][dir]` (which real, zero-based column index to sort by, and
`"asc"`/`"desc"`). None of these are flat, ordinary names FastAPI's own
real automatic query-parameter binding (Lesson 32) can map directly —
`search[value]` is one, real, literal query-string key, not a nested
Python parameter.

The real, correct way to read it:

```python
from fastapi import Request


@app.get("/parts/datatable")
def parts_datatable(request: Request, db: sqlite3.Connection = Depends(get_db)):
    params = request.query_params
    draw = int(params.get("draw", 1))
    start = int(params.get("start", 0))
    length = int(params.get("length", 10))
    search_value = params.get("search[value]", "")
    order_col_index = int(params.get("order[0][column]", 0))
    order_dir = params.get("order[0][dir]", "asc")
```

`request.query_params.get("search[value]", "")` reads that real,
literal bracketed key directly — the honest, correct fix, rather than
attempting to force FastAPI's own ordinary parameter binding onto a
real shape it wasn't built to parse.

### Discard

Nothing throwaway — `parts_datatable` is a real, permanent endpoint,
completed in this lesson's own second unit.

### Mechanical Walkthrough

- `def parts_datatable(request: Request, db: sqlite3.Connection =
  Depends(get_db)):` — **(a) first appearance** of `Request` as a real
  handler parameter, full treatment above; `Depends(get_db)` — **(b)
  hard concept reappearing**, Lesson 31's own dependency, unchanged.
- `params = request.query_params` — **(a) first appearance** of
  `.query_params`, full treatment above.
- `params.get("draw", 1)` / `params.get("search[value]", "")` — **(a)
  first appearance** of reading a real, literal (including
  bracket-containing) query-string key by exact name, with a real,
  sensible default if it's genuinely absent.

### CS Lens

DataTables' own real protocol is a concrete instance of a **contract
between a UI component and a data source**: the component (DataTables)
defines exactly what shape of request it will send and exactly what
shape of response it requires, and any real backend wanting to serve it
must honestly implement that exact contract — the identical underlying
idea as DB-API 2.0 (Lesson 17's own CS Lens), here specified by a
frontend library instead of a language-level standard.

### SE Lens

The real, honest reason this lesson reaches for `Request` directly,
rather than trying to force a cleaner-looking, ordinary FastAPI
signature: DataTables' own real protocol was designed once, years ago,
for maximum real compatibility with plain server-side scripts (PHP,
classic ASP), using PHP's own real, native bracket-array query-string
convention — not designed with FastAPI's own, later, more structured
parameter-binding style in mind at all. Working with a real, external
contract sometimes means accepting its own real shape rather than
reshaping it to fit a framework's own preferred idiom.

## Concept Unit: The Real Response — `recordsTotal`, `recordsFiltered`, `data`

### The Problem

Reading DataTables' own real request is only half the contract. What
does it require back?

### Introduce the Concept in Isolation

The completed endpoint:

```python
@app.get("/parts/datatable")
def parts_datatable(request: Request, db: sqlite3.Connection = Depends(get_db)):
    params = request.query_params
    draw = int(params.get("draw", 1))
    start = int(params.get("start", 0))
    length = int(params.get("length", 10))
    search_value = params.get("search[value]", "")
    order_col_index = int(params.get("order[0][column]", 0))
    order_dir = params.get("order[0][dir]", "asc")

    sortable_columns = ["name", "price", "quantity"]
    order_col = sortable_columns[order_col_index] if 0 <= order_col_index < len(sortable_columns) else "name"
    order_dir_sql = "DESC" if order_dir == "desc" else "ASC"

    where = "WHERE name LIKE ?" if search_value else ""
    where_params = (f"%{search_value}%",) if search_value else ()

    total = db.execute("SELECT COUNT(*) FROM parts").fetchone()[0]
    filtered = db.execute(f"SELECT COUNT(*) FROM parts {where}", where_params).fetchone()[0]
    rows = db.execute(
        f"SELECT * FROM parts {where} ORDER BY {order_col} {order_dir_sql} LIMIT ? OFFSET ?",
        where_params + (length, start),
    ).fetchall()

    return {
        "draw": draw,
        "recordsTotal": total,
        "recordsFiltered": filtered,
        "data": [dict(row) for row in rows],
    }
```

```
$ curl "http://127.0.0.1:8000/parts/datatable?draw=1&start=0&length=2&search%5Bvalue%5D=&order%5B0%5D%5Bcolumn%5D=1&order%5B0%5D%5Bdir%5D=desc"
{"draw":1,"recordsTotal":14,"recordsFiltered":14,"data":[{"id":3,"name":"Drill", ...},{"id":14,"name":"Pry Bar", ...}]}
```

`draw` echoes back exactly `1`, `recordsTotal` reports every real row
(unfiltered), `recordsFiltered` — identical here, since `search[value]`
was empty — would genuinely differ from `recordsTotal` the moment a
real search narrows the result, and `data` holds exactly `length`
rows, correctly sorted by column index `1` (`price`) descending.

The real frontend change, matching:

```js
$("#parts-table").DataTable({
    serverSide: true,
    ajax: { url: "http://127.0.0.1:8000/parts/datatable" },
    columns: [
        { data: "name" },
        { data: "price" },
        { data: "quantity" },
    ],
});
```

### Discard

Nothing throwaway — this real endpoint and this real frontend
configuration are both permanent, replacing Lesson 39's own client-side
version entirely.

### Mechanical Walkthrough

- `sortable_columns = ["name", "price", "quantity"]` / `order_col =
  sortable_columns[order_col_index] if 0 <= order_col_index <
  len(sortable_columns) else "name"` — **(a) first appearance** of a
  real, deliberate **column allowlist**: `order_col_index` is real,
  external, user-influenced data — used here to *select from* a fixed,
  hardcoded real Python list, never spliced directly into SQL as raw
  text. This is the real, safe way to make a column name dynamic:
  SQL's own `?` placeholders (Lesson 18) can only ever parameterize a
  *value*, never a real column or table *identifier* — the correct,
  safe fix for identifiers is validating the real, external input
  against a fixed, known-safe list first, exactly as done here.
- `f"SELECT * FROM parts {where} ORDER BY {order_col} {order_dir_sql}
  LIMIT ? OFFSET ?"` — **(b) hard concept reappearing** for the overall
  safe-shape-only f-string pattern (Lesson 34); `order_col` specifically
  is safe here only *because* of the allowlist step immediately above —
  worth restating directly, since this is the first time this series
  has interpolated something drawn from real, external input into a
  query's own shape, not just chosen between two fixed literal strings.
- `return {"draw": draw, "recordsTotal": total, "recordsFiltered":
  filtered, "data": [...]}"` — **(a) first appearance** of this real,
  specific response shape DataTables' own protocol requires.

### CS Lens

`recordsTotal` vs. `recordsFiltered` is a real, direct instance of
distinguishing a collection's own **cardinality before and after a
predicate is applied** — the identical real distinction Lesson 34's own
`X-Total-Count` header already made once, generalized here into two
separate real numbers specifically because DataTables' own UI needs to
show both — "12 total, 3 matching your search" — simultaneously.

### SE Lens

The real, serious security lesson embedded directly in this unit's own
`order_col` handling: **never interpolate real, external input directly
as a SQL identifier**, even when it's tempting to treat it "like a
value" the way `?` placeholders handle everything else in this series.
An unvalidated `order_col_index`, used to build an arbitrary column
name string without the allowlist step, would be a real, second
injection vector — genuinely different in mechanism from Lesson 18's
own classic value-based injection, but just as real, and this lesson's
own fixed `sortable_columns` list is the entire, complete fix: bound
input, checked against known-safe values, before it ever reaches the
SQL string at all.

## Connect the pieces

One real, complete endpoint, `GET /parts/datatable`, speaking
DataTables' own real, exact protocol: `request.query_params` read its
real, bracket-named request fields directly; a real column allowlist
made `order_col_index` safe to use as a SQL identifier; and the real
response — `draw`, `recordsTotal`, `recordsFiltered`, `data` — gave
DataTables everything it needs to correctly show real pagination,
sorting, and search state, entirely server-driven, with the browser
never holding more than one real page of rows at a time.

## What breaks without this

Send a real, out-of-range `order[0][column]` value, testing the
allowlist directly:

```
$ curl "http://127.0.0.1:8000/parts/datatable?draw=1&start=0&length=5&order%5B0%5D%5Bcolumn%5D=99&order%5B0%5D%5Bdir%5D=asc"
{"draw":1,"recordsTotal":14,"recordsFiltered":14,"data":[...]}
```

No error — a real, honest fallback to `"name"`, exactly as
`order_col_index if 0 <= order_col_index < len(sortable_columns) else
"name"` promises. Now, real, direct proof of what the allowlist
actually prevents — reverting that one line to blindly trust the real,
external index without the range check, then requesting a real,
deliberately malicious value crafted to break out of the identifier
position, would produce a genuine SQL syntax error at best, or a real,
successful injection at worst — this lesson's own allowlist is not
optional defensive styling; it's the entire real fix.

## Exercises

1. Add real search support for `price` and `quantity`, not just `name`
   — DataTables' own real, individual per-column search parameters
   (`columns[0][search][value]`, and so on) are a real, further
   extension of this exact same protocol; research their real, exact
   parameter names and wire at least one in.
2. Reproduce this lesson's own real allowlist-bypass danger
   deliberately, in a disposable copy of this endpoint only: replace
   the safe `sortable_columns[order_col_index] if ... else "name"` line
   with a naive `f"column_{order_col_index}"`-style direct
   interpolation, and explain in your own words — without necessarily
   crafting a full, working exploit — what real category of attack this
   reopens.

## Definition of Done

- [ ] You implemented `GET /parts/datatable`, correctly reading
      DataTables' own real bracket-named query parameters via
      `request.query_params`.
- [ ] You returned the real, exact `draw`/`recordsTotal`/
      `recordsFiltered`/`data` shape DataTables requires.
- [ ] You confirmed sort, search, and pagination in the real UI now
      each trigger a real, new backend request, rather than operating
      on an already-downloaded set.
- [ ] You can explain, from memory, why `order_col` requires an
      allowlist rather than direct parameterization.
- [ ] You completed both exercises.

## Next

[Lesson 41 — Add/Edit/Delete From the UI](lesson-41-add-edit-delete-from-the-ui.md)
gives this real, working table real, working mutation controls — every
capability in this arc so far has only ever read `parts`.
