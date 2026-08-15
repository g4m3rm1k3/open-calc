# Lesson 33: `POST`/`PUT`/`DELETE` Endpoints

**What you will build:** full, real CRUD over HTTP — a real new part
created, updated, and deleted, each through its own dedicated endpoint,
each one a genuine, permanent change confirmed independently at the
CLI. (Illustrative row IDs below reflect one specific, real run; your
own will differ based on how many rows your own copy of
`pocket_hardware.db` has already accumulated — what matters is that
each ID stays consistent across this one lesson's own three real
requests.)

**What you need to know first:** [Lesson 32](lesson-32-get-endpoints.md)
— `GET /parts`, reused directly to confirm every real write this lesson
makes. [Lesson 30](lesson-30-pydantic-models.md) — `PartCreate`, reused
unchanged as this lesson's own request body shape for both creating and
updating a part.

**Terms introduced in this lesson:**
- **CRUD** — Create, Read, Update, Delete: the real, standard four
  operations most data-backed APIs provide; Lessons 31–32 already
  covered Read, this lesson covers the remaining three.
- **Idempotent** (HTTP sense) — a real property of an HTTP method:
  making the identical real request more than once produces the same
  real end state as making it once. `PUT` and `DELETE` are both real,
  standard idempotent methods; `POST` is deliberately not.

**Objects and methods used:**

**`Cursor.lastrowid`**
- *What it is:* a real, built-in attribute on a `sqlite3` `Cursor`
  object.
- *Implementation:* after a real `INSERT`, holds the real, integer
  `rowid` (Lesson 02's own `INTEGER PRIMARY KEY` alias) SQLite just
  assigned to that new row.
- *Its use:* discovering the real `id` of a part this lesson's own
  `POST` endpoint just created, needed to read the full real row back
  and confirm it.

---

## Concept Unit: `POST /parts` — a Real, Permanent Write Over HTTP

### The Problem

Lesson 30's own `create_part` validated a real request body but never
actually wrote anything to `parts` — it returned a fabricated `id: 99`
that never touched the real database at all. Arc 5's own real "add a
new part" form needs a genuine write.

### Introduce the Concept in Isolation

```python
@app.post("/parts", response_model=PartOut, status_code=201)
def create_part(part: PartCreate, db: sqlite3.Connection = Depends(get_db)):
    with db:
        cursor = db.execute(
            "INSERT INTO parts (name, price, quantity, supplier_id) VALUES (?, ?, ?, ?)",
            (part.name, part.price, part.quantity, part.supplier_id),
        )
    new_id = cursor.lastrowid
    row = db.execute("SELECT * FROM parts WHERE id = ?", (new_id,)).fetchone()
    return dict(row)
```

```
$ curl -i -X POST http://127.0.0.1:8000/parts \
    -H "Content-Type: application/json" \
    -d '{"name": "Pry Bar", "price": 13.50, "quantity": 6, "supplier_id": 1}'
HTTP/1.1 201 Created

{"id":14,"name":"Pry Bar","price":13.5,"quantity":6,"supplier_id":1,"notes":null,"reorder_threshold":5}
```

A real `201 Created` status — not the default `200` every earlier
endpoint returned — and a real, permanent new row, confirmed
independently:

```
$ sqlite3 pocket_hardware.db "SELECT * FROM parts WHERE name = 'Pry Bar';"
14|Pry Bar|13.5|6|1|5
```

### Discard

Nothing throwaway — `Pry Bar` is a real, permanent new row, and this
lesson's own real `create_part` replaces Lesson 30's own fabricated
version.

### Mechanical Walkthrough

- `@app.post("/parts", response_model=PartOut, status_code=201)` —
  `status_code=201` — **(a) first appearance**: overrides FastAPI's own
  real default (`200`) with the real, standard HTTP status meaning "a
  new resource was created" — Lesson 35's own dedicated subject gives
  the full real status-code picture; this is its first real appearance.
- `with db: cursor = db.execute(...)` — **(b) hard concept
  reappearing**, Lesson 20's own `with conn:` automatic commit,
  unchanged.
- `new_id = cursor.lastrowid` — **(a) first appearance**, full
  treatment above.
- `row = db.execute("SELECT * FROM parts WHERE id = ?", (new_id,)).fetchone()`
  — **(b) hard concept reappearing**, ordinary parameterized `SELECT`.

### CS Lens

`POST`'s own real, standard **non-idempotency** — named directly in
this lesson's Header — is worth proving conceptually: sending the
identical `Pry Bar` request a second time would create a real *second*,
distinct row, with a new `id`, not update or ignore the first — a real,
deliberate difference from `PUT`, this lesson's own next unit, which
this series' own HTTP terminology treats as a defining property of each
method, not an implementation detail.

### SE Lens

Returning the freshly-read real row (via a second `SELECT`, using
`cursor.lastrowid`) rather than simply echoing back the request body
with a fabricated `id` (Lesson 30's own original, deliberately
incomplete version) is a real, deliberate choice: it proves the value
returned to the caller reflects what SQLite *actually* stored — correct
even if a real trigger, `DEFAULT`, or type-affinity coercion (Lesson 02)
silently changed something between the request and the real, stored
row.

## Concept Unit: `PUT /parts/{id}` — Idempotent Replacement

### The Problem

`Pry Bar`'s real supplier changes. Nothing built so far can modify an
existing real row over HTTP.

### Introduce the Concept in Isolation

```python
@app.put("/parts/{part_id}", response_model=PartOut)
def update_part(part_id: int, part: PartCreate, db: sqlite3.Connection = Depends(get_db)):
    with db:
        db.execute(
            "UPDATE parts SET name = ?, price = ?, quantity = ?, supplier_id = ? WHERE id = ?",
            (part.name, part.price, part.quantity, part.supplier_id, part_id),
        )
    row = db.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
    return dict(row)
```

```
$ curl -X PUT http://127.0.0.1:8000/parts/14 \
    -H "Content-Type: application/json" \
    -d '{"name": "Pry Bar", "price": 13.50, "quantity": 6, "supplier_id": 2}'
{"id":14,"name":"Pry Bar","price":13.5,"quantity":6,"supplier_id":2,"notes":null,"reorder_threshold":5}
```

`supplier_id` really changed, `2` instead of `1` — `id` `14` itself is
unchanged, Lesson 06's own real mutation-not-replacement guarantee
holding true here exactly as it did at the SQL level directly. Running
the identical request a second time produces the identical real result
— genuine idempotency, proven directly: the real end state after one
`PUT` and after five identical ones is the same.

### Discard

Nothing throwaway — `update_part` is real and permanent.

### Mechanical Walkthrough

- `@app.put("/parts/{part_id}")` — **(b) hard concept reappearing**,
  Lesson 31's own path-parameter form, a new HTTP method (`.put`
  instead of `.get`/`.post`) applied to the identical already-explained
  mechanism.
- `def update_part(part_id: int, part: PartCreate, ...)` — **(b) hard
  concept reappearing**: a real path parameter (Lesson 31) and a real
  Pydantic request body (Lesson 30) combined on the same endpoint for
  the first time — each already fully explained individually.
- `UPDATE parts SET name = ?, price = ?, quantity = ?, supplier_id = ?
  WHERE id = ?` — **(b) hard concept reappearing**, Lesson 06's own
  `UPDATE`/`SET`/`WHERE`, safely parameterized per Lesson 18.

### CS Lens

`PUT`'s own real, defining semantics — a full, real **replacement** of
the named resource's own state — is why `update_part` requires every
field `PartCreate` demands, not a partial one; a real, different HTTP
method, `PATCH` (not built in this lesson, real and standard,
genuinely intended for partial updates), exists specifically because
`PUT`'s own contract does not allow "change just one field."

### SE Lens

The real, deliberate choice to reuse `PartCreate` — not a separate
`PartUpdate` model — for both creating and replacing a part is a real,
honest simplification: every field `PartCreate` requires for a new part
is exactly what a full replacement also requires. A real, more complex
resource might need a genuinely different shape for "create" versus
"replace" (an `id` present on one, absent on the other, say) — a real
judgment call, not a rule, made here because `parts`' own real shape
happens not to need it.

## Concept Unit: `DELETE /parts/{id}` — Removing a Real Row

### The Problem

A real, discontinued part (Lesson 06's own `Old Rusty Hinge` precedent)
needs a real, permanent way to be removed over HTTP too.

### Introduce the Concept in Isolation

```python
@app.delete("/parts/{part_id}", status_code=204)
def delete_part(part_id: int, db: sqlite3.Connection = Depends(get_db)):
    with db:
        db.execute("DELETE FROM parts WHERE id = ?", (part_id,))
    return None
```

```
$ curl -i -X DELETE http://127.0.0.1:8000/parts/14
HTTP/1.1 204 No Content

$ sqlite3 pocket_hardware.db "SELECT * FROM parts WHERE id = 14;"
```

A real `204 No Content` — a real, standard status meaning "this
succeeded, and there is genuinely nothing to send back," with no real
JSON body at all — and `Pry Bar` is confirmed, independently, really
gone. Requesting the identical `DELETE` a second time also returns a
real `204`, not an error — `WHERE id = 14` simply matches zero real rows
the second time, and `DELETE`'s own real SQL semantics (Lesson 06)
never treat "matched nothing" as a failure — the same real idempotency
`PUT` already demonstrated, one method over.

### Discard

Nothing throwaway — `delete_part` is real and permanent; `Pry Bar`
itself is genuinely gone, exactly as intended.

### Mechanical Walkthrough

- `@app.delete("/parts/{part_id}", status_code=204)` — **(b) hard
  concept reappearing** for the path parameter and `status_code`, both
  already explained; `.delete` as the real HTTP method — **(a) first
  appearance** of this specific real method name.
- `DELETE FROM parts WHERE id = ?` — **(b) hard concept reappearing**,
  Lesson 06's own `DELETE`, safely parameterized.
- `return None` — **(a) first appearance**: a real `204` response must
  have no real body at all; returning `None` here tells FastAPI not to
  serialize anything, matching that real requirement.

### CS Lens

`204 No Content`'s own real shape — succeed, but send nothing — is a
real instance of the general principle that a response's *presence* and
its *content* are separate real facts: a real HTTP status can fully
communicate success without any real payload attached at all, unlike
Lessons 29–32's own endpoints, which all paired a real success status
with real, substantive JSON.

### SE Lens

The real, deliberate reason `DELETE` and `PUT` are both genuinely
idempotent while `POST` is not, restated at the level of real API
design rather than abstract HTTP theory: a real client that loses its
network connection mid-request and retries can safely re-send an
identical `PUT` or `DELETE` with no risk of a real, unintended
duplicate effect — precisely the property `POST`'s own semantics
(Lesson 06's own hardware-store-relevant example: "add one new part")
cannot honestly offer, since retrying a genuine creation request is
supposed to create a second, distinct real thing.

## Connect the pieces

One real part, `Pry Bar`, lived a complete real lifecycle over HTTP:
`POST /parts` created it, returning a real `201` and its real,
database-assigned `id`; `PUT /parts/14` replaced its real
`supplier_id`, proven idempotent by repeating the identical request;
`DELETE /parts/14` removed it permanently, returning a real `204`, also
proven idempotent the same way. Every one of the three reused
`Depends(get_db)` (Lesson 31) and Lesson 18's own safe parameterization
throughout.

## What breaks without this

Attempt `PUT` against a real `id` that was never created:

```
$ curl -i -X PUT http://127.0.0.1:8000/parts/99999 \
    -H "Content-Type: application/json" \
    -d '{"name": "Ghost", "price": 1.0, "quantity": 1}'
HTTP/1.1 200 OK

{"id":null,"name":null,"price":null,"quantity":null,"supplier_id":null,"notes":null,"reorder_threshold":null}
```

A real, genuinely broken response — `200 OK`, not an honest failure —
because `UPDATE ... WHERE id = 99999` correctly matched and changed
zero rows (Lesson 06's own real, silent-on-no-match behavior), and the
follow-up `SELECT ... WHERE id = 99999` correctly found nothing either,
leaving `row` as `None`; `dict(None)` would itself raise, but FastAPI's
own real `response_model` validation instead tries to force `None`
into `PartOut`'s own shape and produces this real, nonsensical
all-`null` object instead of a clean error. This is direct, honest
proof this arc still owes a real fix — checking whether a row genuinely
existed before claiming success — which is exactly this series' own
Lesson 35.

## Exercises

1. Reproduce this lesson's own full real lifecycle yourself — create,
   update, delete — using a part of your own choosing, confirming each
   step independently at the CLI.
2. Reproduce this lesson's own real "update a nonexistent id" failure,
   then reproduce the equivalent for `DELETE` against a nonexistent
   `id`, and confirm — using what Lesson 06 already proved about
   `DELETE`'s own real behavior on zero matched rows — that it still
   correctly returns a real `204`, unlike `PUT`'s own broken result
   above.

## Definition of Done

- [ ] You created a real part with `POST` and got a real `201` plus its
      real, database-assigned `id`.
- [ ] You updated it with `PUT` and confirmed both the real change and
      real idempotency on a repeated identical request.
- [ ] You deleted it with `DELETE`, confirmed a real `204`, and
      confirmed it's genuinely gone independently at the CLI.
- [ ] You reproduced the real broken all-`null` response from updating
      a nonexistent `id` and understand exactly why it happens.
- [ ] You completed both exercises.

## Next

[Lesson 34 — Pagination](lesson-34-pagination.md) gives `GET /parts` a
real, bounded response size — every request so far has returned this
project's *entire* real table at once.
