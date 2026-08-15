# Lesson 57: Why Your Data Looks Stale

**What you will build:** real, direct proof of two genuinely different,
easy-to-conflate causes behind "the app shows old data" — a cached HTTP
response never reaching the real, current backend, and DataTables
itself silently ignoring a real, new configuration because an old
instance was never properly discarded — plus the real, correct fix for
each.

**What you need to know first:** [Lesson 41](lesson-41-add-edit-delete-from-the-ui.md)
— `ajax.reload()`, this lesson's own real, correct tool for one of its
two causes. [Lesson 39](lesson-39-rendering-the-backends-data-as-a-datatable.md)
— `$(selector).DataTable({...})`'s own real, original initialization
call, whose real behavior on a *second* call is this lesson's own other
subject.

**Terms introduced in this lesson:**
- **HTTP caching** — a real browser (or embedded webview engine)
  behavior: storing a prior response and reusing it for an identical
  later request, without necessarily contacting the real server again
  at all.

**Objects and methods used:**

**`$.fn.DataTable.isDataTable()`**
- *What it is:* a real, static jQuery DataTables function.
- *Implementation:* `$.fn.DataTable.isDataTable(selector)` — returns a
  real `true`/`false`, reporting whether the matched element is already
  a real, initialized DataTable.
- *Its use:* the real, correct check before ever calling `.DataTable()`
  a second time on the same real element.

**`DataTable().destroy()`**
- *What it is:* a real method on an already-initialized DataTables
  instance.
- *Implementation:* `$(selector).DataTable().destroy()` — tears down
  the real DataTable, returning the underlying `<table>` element to its
  own, real, plain HTML state, ready to be initialized fresh.
- *Its use:* the real, correct way to legitimately reinitialize a table
  whose own column structure has genuinely changed.

---

## Concept Unit: A Cached Response, Never Reaching the Real Backend

### The Problem

`GET /parts` (Lesson 32) is an ordinary HTTP request. Ordinary HTTP
requests are, by real, standard browser behavior, sometimes eligible to
be served from a real, local cache instead of genuinely reaching the
server again — including inside `pywebview`'s own embedded browser
engine, which follows the identical real HTTP caching rules any browser
does.

### Introduce the Concept in Isolation

DataTables' own real `ajax` option, exactly as Lesson 39 first wrote
it, makes no real statement about caching at all:

```js
$("#parts-table").DataTable({
    ajax: { url: "http://127.0.0.1:8000/parts", dataSrc: "" },
    columns: [{ data: "name" }, { data: "price" }, { data: "quantity" }],
});
```

Underneath, DataTables issues this real request through jQuery's own
`$.ajax`, whose own real, documented default for a JSON `GET` request
is `cache: true` — meaning jQuery adds nothing to prevent the browser
from reusing a real, prior response for an identical URL, and neither
does Arc 4's own FastAPI backend, which — as written through Lesson 36
— never sets any real caching header on `GET /parts` at all. The real,
concrete risk this leaves open: a real, second identical request, after
real, new data has been written, can be served from a real, local
cache instead of reaching `list_parts` (Lesson 32) again at all.

The real, direct, two-part fix — first, client-side:

```js
$("#parts-table").DataTable({
    ajax: { url: "http://127.0.0.1:8000/parts", dataSrc: "", cache: false },
    columns: [{ data: "name" }, { data: "price" }, { data: "quantity" }],
});
```

`cache: false`, passed straight through to jQuery's own `$.ajax`,
appends a real, unique, ever-changing query parameter
(`&_=1755286...`, a real millisecond timestamp) to every real request —
guaranteeing each one's own real URL has never been seen before, so
there is genuinely nothing for any cache to have stored.

And, more robustly, server-side — the identical real technique Lesson
34 already used to attach `X-Total-Count`:

```python
@app.get("/parts")
def list_parts(response: Response, db: sqlite3.Connection = Depends(get_db), ...):
    response.headers["Cache-Control"] = "no-store"
    ...
```

`Cache-Control: no-store` is a real, explicit, standard HTTP instruction:
never store this response at all, for any real reuse, by any real
cache, anywhere along the way — the real, correct, unambiguous fix, not
dependent on any one specific client's own default caching behavior.

### Discard

Nothing throwaway — both real fixes are permanent, correct additions to
this project's own `list_parts` endpoint and its own DataTables
configuration.

### Mechanical Walkthrough

- `ajax: { url: "...", dataSrc: "", cache: false }` — **(a) first
  appearance** of DataTables' own real `cache` option, full treatment
  above; `url`/`dataSrc` — **(b) hard concept reappearing**, Lesson
  39's own already-explained keys.
- `response.headers["Cache-Control"] = "no-store"` — **(b) hard concept
  reappearing**, Lesson 34's own real `response.headers[...]`
  assignment, applied to a new, real, standard header name.

### CS Lens

This is a real, direct instance of **cache invalidation** — famously
named, only half-jokingly, one of the two genuinely hard problems in
computer science: a cache is only ever correct if it's reliably told,
or reliably proven, exactly when its own stored data has gone stale.
This lesson's own two fixes take the simplest, most reliable real
approach — never cache this specific response at all — rather than the
real, harder alternative of caching it correctly and invalidating it
precisely.

### SE Lens

The real, honest reason this lesson applies *both* fixes rather than
picking one: `cache: false` protects this one, specific DataTables
call; `Cache-Control: no-store` protects *every* real caller of `GET
/parts` — a direct `curl`, a real, future second UI, anything — since
the real guarantee lives at the response itself, not inside one
client's own configuration. Relying on the client-side fix alone would
leave every other real consumer of this endpoint exposed to the
identical real staleness this lesson just proved.

## Concept Unit: A DataTable That Silently Ignored Its Own New Configuration

### The Problem

A real, genuinely new database — different real column structure, not
just refreshed rows — needs Arc 5's own table rebuilt with a real, new
`columns` configuration, not merely refreshed data (`ajax.reload()`
alone, Lesson 41's own tool, only re-fetches rows against an
*unchanged* column mapping). Does simply calling `.DataTable({...})`
again, with the new configuration, do that safely?

### Introduce the Concept in Isolation

```js
$("#parts-table").DataTable({ ajax: { url: "http://127.0.0.1:8000/parts", dataSrc: "" }, columns: [...] });

// Later, once a genuinely new database with different columns loads:
$("#parts-table").DataTable({ ajax: { url: "http://127.0.0.1:8000/books", dataSrc: "" }, columns: [...] });
```

```
DataTables warning: table id=parts-table - Cannot reinitialise DataTable.
For more information about this error, please see https://datatables.net/tn/3
```

A real, genuine warning — and, critically, the *first* real
configuration is what keeps running: the table keeps querying the old,
original URL with the old, original column mapping, silently ignoring
every real, new setting the second call tried to supply. This is
exactly the real complaint "the library seems to hold on to old data"
describes precisely: not a caching problem at all this time, but
DataTables' own real, deliberate refusal to reinitialize an
already-initialized table silently or by accident.

The real, correct fix — check first, and tear down explicitly before
building fresh:

```js
function loadPartsTable(url, columns) {
    if ($.fn.DataTable.isDataTable("#parts-table")) {
        $("#parts-table").DataTable().destroy();
        $("#parts-table thead tr").empty();
    }
    $("#parts-table").DataTable({
        ajax: { url: url, dataSrc: "", cache: false },
        columns: columns,
    });
}
```

Calling `loadPartsTable` a second time, with a genuinely different real
URL and column set, now correctly rebuilds the table from scratch — no
warning, and the real, new configuration genuinely takes effect.

### Discard

Nothing throwaway — `loadPartsTable` is a real, permanent, reusable
function this project's own code calls every time a genuinely new
dataset (not merely new rows) needs to be shown.

### Mechanical Walkthrough

- `$.fn.DataTable.isDataTable("#parts-table")` — **(a) first
  appearance**, full treatment above.
- `$("#parts-table").DataTable().destroy();` — **(a) first appearance**,
  full treatment above.
- `$("#parts-table thead tr").empty();` — **(a) first appearance** of
  jQuery's own real `.empty()` method, removing every real child
  element — needed here because `.destroy()` itself does not clear a
  real, existing header row, which the next `.DataTable({ columns:
  [...] })` call would otherwise conflict with if the new column count
  genuinely differs.

### CS Lens

DataTables' own real refusal to silently reinitialize is a deliberate,
real instance of **failing loudly instead of guessing** — the identical
underlying value this entire series has already praised directly
(Lesson 08's own real foreign-key rejection, Lesson 24's own "duplicate
column name" error): a library that quietly accepted a second, real,
conflicting configuration and picked one arbitrarily would be
genuinely harder to debug than one that refuses and says so directly.

### SE Lens

The real, practical rule this unit leaves this project with, stated
plainly: use `ajax.reload()` (Lesson 41) when only the real *rows*
change against an unchanged real column shape — the cheaper, simpler,
correct tool; reach for this unit's own `destroy()`-then-rebuild
pattern only when the real column structure itself genuinely changes,
such as Lesson 48's own real switch from `parts` to `tbl_book`'s
entirely different shape — using the heavier tool for the lighter job
is real, unnecessary work, and using the lighter tool for the heavier
job is exactly this lesson's own real, reproduced warning.

## Connect the pieces

Two real, genuinely different causes, both producing the identical
real user complaint — "this looks stale." `cache: false` and
`Cache-Control: no-store` together closed a real, HTTP-level caching
gap, guaranteeing every request for `parts` genuinely reaches Arc 4's
own live backend. `isDataTable()` and `.destroy()` closed a completely
separate, real gap one layer up: DataTables itself silently keeping an
old, real configuration alive rather than accepting a new one it was
never given permission to discard.

## What breaks without this

Skip the `.empty()` call in `loadPartsTable`, and reinitialize with a
real, *larger* number of columns than the original table had:

```js
$("#parts-table").DataTable().destroy();
// (no .empty() here)
$("#parts-table").DataTable({ ajax: {...}, columns: [/* 4 real columns, up from 3 */] });
```

A real, genuine rendering error, or a real, visibly misaligned table —
the leftover real `<th>` cells from the original, three-column header
row are still physically present in the DOM, and DataTables' own real
new, four-column configuration has no way to reconcile the mismatch on
its own. This is direct, provable proof `.destroy()` alone is not
always sufficient the moment a real column *count* changes, not merely
its data.

## Exercises

1. Reproduce this lesson's own real "Cannot reinitialise DataTable"
   warning yourself, then apply the `isDataTable()`/`destroy()` fix and
   confirm a genuinely new configuration takes effect correctly.
2. Confirm, using your own browser's real developer tools (the Network
   tab), that `cache: false` actually changes the real request URL sent
   on a second, identical call — compare it directly against a real
   request made without `cache: false`.

## Definition of Done

- [ ] You applied both real fixes — `cache: false` and `Cache-Control:
      no-store` — and can state why both are necessary rather than
      redundant.
- [ ] You reproduced the real "Cannot reinitialise DataTable" warning
      and fixed it with `isDataTable()`/`destroy()`.
- [ ] You can state, precisely, when `ajax.reload()` is the correct
      tool and when a real `destroy()`-and-rebuild is required instead.
- [ ] You completed both exercises.

## Next

[Lesson 58 — Serving Joined Data From Multiple Databases, Live](lesson-58-serving-joined-data-from-multiple-databases-live.md)
replaces a real, separate, batch JSON-export step with a real, live
query joining more than one database file directly.
