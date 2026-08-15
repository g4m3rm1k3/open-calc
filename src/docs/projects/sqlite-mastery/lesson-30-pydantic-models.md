# Lesson 30: Pydantic Models

**What you will build:** a real, structured shape for "a part to
create," rejecting a real, malformed request automatically — before a
single line of this arc's own handler code ever runs.

**What you need to know first:** [Lesson 29](lesson-29-fastapi-project-setup-and-the-first-endpoint.md)
— `main.py`'s own real, running server, which this lesson's endpoint is
added to. [Lesson 07](lesson-07-constraints.md) — SQL's own real
`CHECK`/`NOT NULL` constraints, enforced at the database boundary; this
lesson enforces a real, comparable shape one boundary earlier, before a
request's own data ever reaches SQL at all.

**Terms introduced in this lesson:** none new — Pydantic's own
`BaseModel` is this lesson's subject, covered as Objects and methods
below.

**Objects and methods used:**

**`pydantic.BaseModel`**
- *What it is:* a real, third-party base class (installed automatically
  alongside FastAPI, which depends on it directly) for declaring a
  real, validated data shape.
- *Implementation:* a subclass of `BaseModel` with real, type-annotated
  class attributes (`name: str`, `price: float`) — each one becomes a
  real, required field, validated against its declared type the
  instant an instance is constructed from real, external data (here,
  an incoming request body); `field: type | None = None` marks a field
  real and optional instead.
- *Its use:* `PartCreate`, this lesson's own real, validated shape for
  "the data needed to create a new part."

---

## Concept Unit: A Real, Validated Request Body

### The Problem

Lesson 29's own `read_root` took no real input at all. A real "create a
part" endpoint has to accept real data from outside the program — the
exact same kind of untrusted input Lesson 18 already proved dangerous
if handled carelessly — and needs a real, enforced shape before that
data goes anywhere near a `parts_repository.py` call.

### Introduce the Concept in Isolation

A real, small addition to `main.py`:

```python
from pydantic import BaseModel


class PartCreate(BaseModel):
    name: str
    price: float
    quantity: int
    supplier_id: int | None = None


@app.post("/parts")
def create_part(part: PartCreate):
    return part
```

A real, valid request:

```
$ curl -X POST http://127.0.0.1:8000/parts \
    -H "Content-Type: application/json" \
    -d '{"name": "Socket Set", "price": 34.99, "quantity": 4, "supplier_id": 1}'
{"name":"Socket Set","price":34.99,"quantity":4,"supplier_id":1}
```

A real, malformed one — `price` sent as genuinely non-numeric text:

```
$ curl -X POST http://127.0.0.1:8000/parts \
    -H "Content-Type: application/json" \
    -d '{"name": "Socket Set", "price": "expensive", "quantity": 4}'
{"detail":[{"type":"float_parsing","loc":["body","price"],"msg":"Input should be a valid number, unable to parse string as a number","input":"expensive"}]}
```

`create_part`'s own body **never ran at all** — no `print`, no
breakpoint, nothing inside the function executes for this second
request. FastAPI inspected `create_part`'s own real type annotation
(`part: PartCreate`), and before calling the function, tried to
construct a real `PartCreate` from the incoming JSON; construction
itself failed, and FastAPI responded with a real, structured `422`
error describing exactly which field (`"loc":["body","price"]`) and
exactly why (`"msg":"..."`), entirely on its own.

### Discard

Nothing throwaway — `PartCreate` and `create_part` are both real,
permanent additions to `main.py`, extended directly in Lesson 33 to
actually write into `parts`.

### Mechanical Walkthrough

- `class PartCreate(BaseModel):` — **(a) first appearance**, full
  treatment above.
- `name: str` / `price: float` / `quantity: int` — **(a) first
  appearance** of a real, required Pydantic field: Python's own type-
  annotation syntax (already familiar), given genuine, enforced runtime
  meaning here rather than the purely advisory role a plain type hint
  has elsewhere in ordinary Python.
- `supplier_id: int | None = None` — **(a) first appearance** of a real,
  *optional* Pydantic field: the `= None` default is what makes it
  optional; `int | None` — **(b) hard concept reappearing**, C#'s own
  nullable-type framing from this series' sibling curricula doesn't
  apply here, but Python's own `|` union-type syntax is assumed already
  familiar per this series' own README, not re-taught.
- `def create_part(part: PartCreate): return part` — **(a) first
  appearance** of a real Pydantic model used as an endpoint's own
  parameter type: FastAPI reads this annotation specifically to know
  *what shape* to parse the request body into, and to validate it
  before this function body ever runs.

### CS Lens

This is real, direct **boundary validation**, the identical named
principle Lesson 07's own SE Lens already used for SQL constraints —
applied here one real layer earlier: data is checked and rejected at
the moment it *enters* this program from outside, rather than being
allowed in and only failing later, deeper in the system (a real SQL
`CHECK` failure, or worse, a silent, wrong value stored).

Also recognized in: a strongly-typed function's own parameter types
rejecting a caller's mismatched argument at compile time, an HTML
form's own `required`/`type="number"` attributes doing client-side
validation before submission, a network protocol's own framing that
rejects a malformed packet before attempting to interpret its content.

### SE Lens

The real alternative not chosen: accept a raw, untyped JSON body (a
plain Python `dict`) and manually check every real field's presence and
type inside `create_part`'s own body, by hand, with explicit `if`
statements — real, working, and exactly the kind of hand-rolled,
per-endpoint validation logic this series has already named as a real
liability twice (Lesson 01's own hand-rolled filtering, Lesson 07's own
constraint-free schema). `PartCreate`'s own declared shape does that
work once, declaratively, and FastAPI applies it automatically to
every request this endpoint ever receives — the identical real payoff
Lesson 22's own repository pattern already proved for SQL, now applied
to the request boundary itself, one layer earlier.

## Concept Unit: Shaping the Real Response, Not Just the Request

### The Problem

`create_part` currently returns `part` directly — whatever real
`PartCreate` was constructed from the request. Once this endpoint
actually writes to `parts` (Lesson 33), the real row it creates will
have a real `id` the request itself never supplied. Should the response
just be whatever the function happens to return, or something more
deliberate?

### Introduce the Concept in Isolation

A second, real, separate model — for what a part looks like *going
out*, not coming in:

```python
class PartOut(BaseModel):
    id: int
    name: str
    price: float
    quantity: int
    supplier_id: int | None = None


@app.post("/parts", response_model=PartOut)
def create_part(part: PartCreate):
    return {"id": 99, **part.model_dump()}
```

```
$ curl -X POST http://127.0.0.1:8000/parts \
    -H "Content-Type: application/json" \
    -d '{"name": "Socket Set", "price": 34.99, "quantity": 4, "supplier_id": 1}'
{"id":99,"name":"Socket Set","price":34.99,"quantity":4,"supplier_id":1}
```

`response_model=PartOut` tells FastAPI to validate and shape the
*returned* value against `PartOut`'s own real schema, independently of
`PartCreate`'s — proven directly: `create_part`'s own body returns a
plain Python `dict`, not a `PartOut` instance at all, and FastAPI
still correctly validates and serializes it against `PartOut`'s real
shape before sending the response.

### Discard

Nothing throwaway — `PartOut` becomes this arc's own real, standard
shape for a part in every response, starting with Lesson 32's own
real `GET` endpoint.

### Mechanical Walkthrough

- `class PartOut(BaseModel): id: int; ...` — **(b) hard concept
  reappearing**, this lesson's own `BaseModel` shape, applied to a
  genuinely different, second real model.
- `@app.post("/parts", response_model=PartOut)` — **(a) first
  appearance** of `response_model`, full treatment above.
- `part.model_dump()` — **(a) first appearance**: a real Pydantic
  method converting a model instance back into an ordinary Python
  `dict` — needed here to merge `part`'s own real fields with the new
  `id` using `**` (already-known Python dict-unpacking syntax).

### CS Lens

Two separate real models for the same conceptual "part" — one for
input, one for output — is a real, deliberate application of
**interface segregation**: the shape a caller is allowed to *send*
(`PartCreate`, no `id` — a real client cannot invent one) and the shape
a caller *receives* (`PartOut`, `id` included) are kept as two distinct,
independently-evolvable real contracts, rather than one shared shape
forced to serve both directions.

### SE Lens

The real, concrete risk `response_model` closes: without it, returning
a real internal object directly — a real database row containing a
column this project later decides is sensitive, or simply internal —
would leak it to every real caller by accident, the instant that column
existed, with no real, deliberate decision made about exposing it.
`response_model` makes "what this endpoint actually promises to return"
an explicit, checked, real contract, independent of whatever shape the
underlying data happens to have at any given moment.

## Connect the pieces

Two real, separate Pydantic models, each enforcing a real, distinct
contract: `PartCreate` validates what a real caller is allowed to send,
proven directly by a real `422` rejection when `price` arrived as
non-numeric text — validation that happened before `create_part`'s own
body ever ran. `PartOut`, applied via `response_model`, then proved the
identical real validation machinery works in the *other* direction too,
shaping what this endpoint promises to return regardless of the exact
shape of the Python value the handler function happens to return.

## What breaks without this

Omit `response_model` and return a real dict containing a field
`PartOut` was never told about:

```python
@app.post("/parts")
def create_part_unsafe(part: PartCreate):
    return {"id": 99, "internal_note": "flagged for review", **part.model_dump()}
```

```
$ curl -X POST http://127.0.0.1:8000/parts_unsafe -d '{"name": "X", "price": 1.0, "quantity": 1}'
{"id":99,"internal_note":"flagged for review","name":"X","price":1.0,"quantity":1}
```

`internal_note` — never declared in any real model — leaks straight
through, silently, to any real caller. With `response_model=PartOut`
restored, the identical handler body would have this field silently
*dropped* instead — `PartOut` simply has no field to put it in, and
Pydantic keeps only what the declared response shape actually promises.
This is direct, provable proof `response_model` isn't just
documentation — it's a real, enforced filter on what actually leaves
this server.

## Exercises

1. Add a real `SupplierCreate` Pydantic model (`name: str`, `email: str
   | None = None`, `rating: int | None = None`) and a real `POST
   /suppliers` endpoint using it, returning the model directly with no
   `response_model` yet. Confirm a real, valid request succeeds and a
   real, malformed one (a non-integer `rating`) produces the same kind
   of structured `422` this lesson's own `price` example did.
2. Reproduce this lesson's own real "unprotected field leaks" proof
   yourself, then add a correct `response_model` and confirm the exact
   same handler body now correctly omits the extra field from its real
   response.

## Definition of Done

- [ ] You added `PartCreate` and confirmed a real, valid `POST /parts`
      request succeeds.
- [ ] You caused a real, structured `422` validation error with
      malformed input, and can read its real `loc`/`msg` fields to
      identify exactly what was wrong.
- [ ] You added `PartOut` and `response_model`, and confirmed it shapes
      the real response independently of the handler's own return
      value.
- [ ] You reproduced the real field-leak proof and confirmed
      `response_model` closes it.
- [ ] You completed both exercises.

## Next

[Lesson 31 — A Real Database Dependency](lesson-31-a-real-database-dependency.md)
connects this arc's own validated request/response models to
`pocket_hardware.db` itself for the first time — every endpoint so far
has validated data without ever touching the real database.
