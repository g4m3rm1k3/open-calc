# Lesson 39: Rendering the Backend's Data as a DataTable

**What you will build:** Arc 5's own real, permanent UI page for the
first time — a genuine, sortable, searchable, paginated HTML table,
showing every real row from `GET /parts`, built with jQuery DataTables
instead of Lesson 38's own raw `JSON.stringify` output.

**What you need to know first:** [Lesson 38](lesson-38-jquery-fundamentals.md)
— jQuery itself, a real, required dependency DataTables is built
directly on top of. [Lesson 34](lesson-34-pagination.md) — `GET
/parts`'s own real shape, the exact data this lesson's own table
renders.

**Terms introduced in this lesson:**
- **jQuery DataTables** — a real, third-party jQuery plugin
  (`https://datatables.net`) that turns a real, plain HTML `<table>`
  into a genuine, interactive one: sortable columns, a real search box,
  and real pagination, all built in.
- **Client-side processing** — DataTables' own real, default mode: the
  entire real dataset is fetched once, and every real sort, search, or
  page change afterward happens *inside the browser*, with no further
  network requests — the mode this lesson's own table uses; Lesson 40
  covers the real, opposite alternative.

**Objects and methods used:**

**`$(selector).DataTable()`**
- *What it is:* the real, core jQuery DataTables initialization method.
- *Implementation:* `$("#table-id").DataTable({ ajax: {...}, columns:
  [...] })` — given a real, empty (or header-only) `<table>` element,
  fetches real data per the `ajax` option and renders real rows per the
  `columns` option, adding real sort/search/pagination controls
  automatically.
- *Its use:* turning this lesson's own plain `<table>` skeleton into
  Arc 5's own real, first working data view.

---

## Concept Unit: A Real Table, Built From Arc 4's Own Real Data

### The Problem

Lesson 38's own `JSON.stringify` output was real, correct, and
genuinely unusable as an actual UI — no sorting, no searching, no real
visual structure at all. Arc 5's own real goal is a genuine, usable
table.

### Introduce the Concept in Isolation

A real, permanent HTML page — `index.html`, the file `pywebview`'s own
`create_window` (Lesson 37) now points at instead of `hello.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
</head>
<body>
    <table id="parts-table" class="display">
        <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
            </tr>
        </thead>
    </table>

    <script>
        $("#parts-table").DataTable({
            ajax: {
                url: "http://127.0.0.1:8000/parts?limit=100",
                dataSrc: "",
            },
            columns: [
                { data: "name" },
                { data: "price" },
                { data: "quantity" },
            ],
        });
    </script>
</body>
</html>
```

Opened inside the real `pywebview` window, with Arc 4's own backend
running: a real, genuine data table appears — every real `parts` row,
correctly rendered into three real columns, with a real search box and
real, clickable column-header sorting both added automatically, and
real pagination controls at the bottom showing something like "Showing
1 to 12 of 12 entries." Typing into the real search box — say,
`"Drill"` — narrows the real, visible rows live, with no page reload
and, crucially, no new real network request either: every row already
arrived in the single, original `ajax` fetch.

### Discard

Nothing throwaway — `index.html` is Arc 5's own real, permanent UI page
from this lesson forward, extended directly in every later lesson in
this arc.

### Mechanical Walkthrough

- `<link rel="stylesheet" href="https://cdn.datatables.net/.../
  jquery.dataTables.min.css">` — **(a) first appearance** of loading a
  real, third-party CSS file the same real way Lesson 38 already loaded
  a real JS file — a `<link>` tag instead of `<script>`, ordinary HTML.
- `<script src=".../jquery.dataTables.min.js"></script>` — **(b) hard
  concept reappearing**, Lesson 38's own real CDN-loading pattern,
  applied to a second real library; loaded *after* jQuery's own
  `<script>` tag specifically because DataTables is real, direct
  jQuery plugin code, requiring `$` to already exist.
- `<table id="parts-table" class="display"><thead>...</thead></table>`
  — **(a) first appearance** of a real DataTables-ready table skeleton:
  a real `<thead>` naming each real column's own header text, with no
  `<tbody>` at all — DataTables builds that part itself, from the real,
  fetched data.
- `$("#parts-table").DataTable({ ajax: {...}, columns: [...] })` —
  **(a) first appearance**, full treatment above.
- `ajax: { url: "...", dataSrc: "" }` — **(a) first appearance**:
  `url` — the real endpoint to fetch (Lesson 34's own `GET /parts`,
  reused directly, with `?limit=100` since this table isn't yet using
  Lesson 34's own real pagination server-side — Lesson 40's own subject);
  `dataSrc: ""` — a real, required setting telling DataTables the
  fetched JSON response *is itself* the real array of rows, rather than
  a property nested inside a real, wrapping object.
- `columns: [{ data: "name" }, { data: "price" }, { data: "quantity" }]`
  — **(a) first appearance**: maps each real `<thead>` column, in
  order, to the real, matching key inside each fetched row's own JSON
  object — `PartOut`'s own real field names (Lesson 30), unchanged.

### CS Lens

DataTables' own real "client-side processing" mode is a real instance
of the same **fold-then-slice-locally** shape Lesson 39's own broader
arc has already used once conceptually — fetch everything real, once,
then perform every real, subsequent operation (sort, filter, page) over
the already-in-memory result, rather than re-querying a real, external
source for each one.

### SE Lens

The real, honest limit of client-side processing, named directly rather
than left to be discovered later: this lesson's own `?limit=100` is a
real, deliberate ceiling — every real row within it downloads to the
browser in one request, and DataTables' own real sort/search/pagination
all operate purely on that already-downloaded set. This is genuinely
fine at this project's own current real scale (a dozen-plus rows); it
stops being fine the moment `parts` holds many thousands, since every
real search keystroke would still only be searching the *first 100*
downloaded rows, silently missing anything beyond it — the exact real
problem Lesson 40's own "server-side processing" mode exists to solve
correctly instead.

## Connect the pieces

One real, permanent `index.html`, replacing Lesson 38's own raw JSON
dump with a genuine, interactive table: DataTables' own `ajax` option
reused Lesson 34's own real `GET /parts` endpoint directly, `dataSrc:
""` correctly told it the response was already the real row array, and
`columns` mapped each real `PartOut` field (Lesson 30) to its own real,
visible column — producing real, working sort, search, and pagination,
entirely client-side, from one single real backend request.

## What breaks without this

Remove `dataSrc: ""` entirely, leaving every other real setting
unchanged:

```js
$("#parts-table").DataTable({
    ajax: { url: "http://127.0.0.1:8000/parts?limit=100" },
    columns: [{ data: "name" }, { data: "price" }, { data: "quantity" }],
});
```

The real table renders with zero rows, and the real browser console
shows a genuine DataTables error, naming a real, missing `data`
property it expected the response to have. DataTables' own real,
built-in default assumes a real response shaped like `{"data": [...]}`
— a real, common convention this project's own backend deliberately
doesn't follow (Lesson 34's own `GET /parts` returns a bare array
directly) — `dataSrc: ""` is exactly what tells DataTables "the
response itself is the array; there's no wrapping property to look
inside."

## Exercises

1. Add a real fourth column, `Supplier`, reading `supplier_id` — note
   this reuses the raw numeric `supplier_id` value, not a real supplier
   name, since `GET /parts` doesn't currently return one (research and
   optionally implement a real fix: joining supplier names into the
   backend's own response, or leave this honestly incomplete and state
   why in your own words).
2. Confirm, directly, this lesson's own real client-side-processing
   limit: temporarily lower `GET /parts`'s own real default `limit`
   (Lesson 34) to `3`, reload the page, and confirm DataTables' own
   real pagination and search now only ever operate across those three
   real rows — direct, provable proof of this lesson's own SE Lens.

## Definition of Done

- [ ] You rendered every real `parts` row in a genuine, sortable,
      searchable DataTable inside the real `pywebview` window.
- [ ] You confirmed real, client-side search and sort work correctly
      with no additional network request.
- [ ] You caused the real "missing `data` property" failure by removing
      `dataSrc` and understood why it's required for this project's own
      bare-array response shape.
- [ ] You completed both exercises.

## Next

[Lesson 40 — DataTables Server-Side Processing](lesson-40-datatables-server-side-processing.md)
replaces this lesson's own real `?limit=100` ceiling with the real,
correct fix: every sort, search, and page change sent to the backend
directly, so the browser never has to download more than one real page
at a time.
