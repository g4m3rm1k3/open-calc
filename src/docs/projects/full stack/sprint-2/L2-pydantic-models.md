# Sprint 2 · Lesson 2 — Pydantic models: typed data contracts

## What you will build

By the end of this lesson, the work order data model is enforced by Pydantic. Invalid data — wrong types, missing required fields, unknown fields — is rejected automatically with a clear error message before it ever reaches your route logic. You will define a `WorkOrder` model, try to break it, read the validation error, and understand why this boundary matters. The dict-based approach from Lesson 1 is replaced by something the compiler and the runtime both understand.

---

## What you need to know first

- Sprint 2 L1: Python dicts, lists, type annotations, `None`.
- Sprint 1 L3: FastAPI is installed, virtual environment is active.

**Concepts carried forward:** Python type annotations, `None`, dict, list, f-strings, virtual environment.

---

## The lesson

---

### 1. The problem with untyped dicts

**The problem:** In Lesson 1, your work orders were plain dicts. Nothing stops you — or the code that calls your API — from creating this:

```python
bad_order = {
    "id": "not a number",
    "title": 999,
    "status": "invented_status",
    "priority": None,
}
```

Python accepts this without complaint. FastAPI would accept a request body containing this and pass it to your route handler. Your route handler would receive a dict with an integer where a string is expected and a string where an integer is expected, and the resulting bugs would appear deep in the logic, far from where the bad data entered. The error messages would be confusing, the debugging would be painful, and the problem would reach production.

The solution is to define a **schema** — a contract that describes exactly what a work order can contain, enforce it at the boundary (where data enters the system), and reject anything that does not match.

Run this to confirm Pydantic is already installed (it ships with FastAPI):

```
pip show pydantic
```

Expected output includes: `Name: pydantic` and `Version: 2.x.x`

**Walkthrough:** `pip show pydantic` queries the virtual environment's package database and prints metadata about the `pydantic` package. `Name` confirms the package name. `Version` confirms Pydantic v2 is installed. Pydantic v2 was rewritten in Rust and is significantly faster than v1. FastAPI 0.100+ requires Pydantic v2.

**CS lens — validation as a boundary condition.** In computer security and system design, a **boundary** is where data crosses from untrusted to trusted: from user input into application logic, from network data into your code, from one service to another. Every boundary is an opportunity for bad data to enter. Validating at the boundary — rejecting bad data before it enters — is called **input validation**. It is the first line of defence against both bugs and attacks. Data that passes the boundary is trusted; data before it is not.

---

### 2. Define the WorkOrder model

**The problem:** Represent a work order as a Pydantic model with typed, named fields.

Create `backend/models.py`:

```python
from pydantic import BaseModel
from typing import Optional

class WorkOrder(BaseModel):
    id: int
    title: str
    status: str
    priority: str
    assigned_to: Optional[str] = None
```

Test it in a new file, `backend/validate_scratch.py`:

```python
from models import WorkOrder

valid_order = WorkOrder(
    id=1,
    title="Fix conveyor belt",
    status="open",
    priority="high"
)

print(valid_order)
print(f"ID: {valid_order.id}")
print(f"Assigned to: {valid_order.assigned_to}")
```

Run:

```
python3 validate_scratch.py
```

Expected output:
```
id=1 title='Fix conveyor belt' status='open' priority='high' assigned_to=None
ID: 1
Assigned to: None
```

**Walkthrough:**

`from pydantic import BaseModel` — imports `BaseModel`, the base class every Pydantic model inherits from. When you subclass `BaseModel`, Pydantic inspects the class's type annotations at class-creation time (not at instantiation) and builds a validator for each field.

`from typing import Optional` — imports `Optional` from Python's standard `typing` module. `Optional[str]` is equivalent to `Union[str, None]` — a value that is either a string or `None`. This imports `Optional` as a named export from `typing` — the same pattern as `from fastapi import FastAPI`.

`class WorkOrder(BaseModel):` — defines a Python class that inherits from `BaseModel`. **Class inheritance** means `WorkOrder` gets all of `BaseModel`'s behaviour: automatic `__init__` generation, validation on every assignment, JSON serialisation, and schema generation. You do not write the `__init__` method — Pydantic generates it from the field annotations.

**Field annotations:**

`id: int` — a required field. `id` must be an integer. If you do not provide it, Pydantic raises `ValidationError`. If you provide a string that can be converted to an integer (e.g., `"42"`), Pydantic coerces it to `42`. If you provide a string that cannot be converted (e.g., `"hello"`), Pydantic raises `ValidationError`.

`title: str` — a required string field.

`status: str` — a required string field. Later you will restrict this to specific values using `Literal` types.

`assigned_to: Optional[str] = None` — an optional field. `Optional[str]` means the value can be a string or `None`. `= None` is the default value — if `assigned_to` is not provided, it defaults to `None`. Required fields have no default; optional fields have a default.

`WorkOrder(id=1, title="Fix conveyor belt", ...)` — instantiates the model using keyword arguments. Pydantic's generated `__init__` accepts one keyword argument per field. The validation happens here: if any field fails validation, a `ValidationError` is raised before the object is created.

`valid_order.id` — attribute access on a Pydantic model. Unlike a dict (`valid_order["id"]`), Pydantic models use dot notation. Pylance knows the type of `valid_order.id` is `int` and provides type checking and autocomplete.

**CS lens — runtime type enforcement.** Python's type annotations are normally hints — Python does not enforce them at runtime. Pydantic changes this. When you call `WorkOrder(id="not_a_number")`, Pydantic reads the `id: int` annotation and actively tries to convert `"not_a_number"` to an integer. Since it cannot, it raises a `ValidationError`. This is **runtime type enforcement** — enforcing the type contract at the moment data arrives, not at compile time.

**SE lens — the model as a data contract.** `WorkOrder` is a contract: anyone who creates a `WorkOrder` object is guaranteed that `id` is an `int`, `title` is a `str`, and `assigned_to` is a `str | None`. This contract makes every function that receives a `WorkOrder` trustworthy — it can use `order.id` without checking whether it is an integer, because the constructor already verified it. The contract is enforced at the boundary; after the boundary, the data is trusted.

**Real-world connection:** Pydantic is used for data validation at Uber, Microsoft, and every major Python API service. Django REST Framework's serializers, Marshmallow, and attrs serve similar purposes in older codebases. The pattern — define a schema, enforce it at the boundary, trust the data inside — is universal. In Rust it is called `FromRequest`; in Go it is `json.Unmarshal` with struct tags; in Java it is Bean Validation annotations.

**What breaks without this:** If you write `assigned_to: str = None` — without `Optional` — Pydantic v2 raises a validation error when you do not provide `assigned_to`, because `None` is not a valid `str`. You must declare `Optional[str]` to allow `None`.

---

### 3. See what happens when validation fails

**The problem:** The model is defined. Now deliberately break it to understand the error format.

Add to `validate_scratch.py`:

```python
from pydantic import ValidationError

try:
    bad_order = WorkOrder(
        id="not_a_number",
        title=None,
        status="open",
        priority="high"
    )
except ValidationError as validation_error:
    print(validation_error)
```

Expected output:
```
2 validation errors for WorkOrder
id
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='not_a_number', input_type=str]
    For further information visit https://errors.pydantic.dev/2.x/v/int_parsing
title
  Input should be a valid string [type=string_type, input_value=None, input_type=NoneType]
    For further information visit https://errors.pydantic.dev/2.x/v/string_type
```

**Walkthrough:**

`from pydantic import ValidationError` — imports the exception class that Pydantic raises on validation failure. This is a named import from the `pydantic` package.

`try: ... except ValidationError as validation_error:` — a **try/except block** — Python's exception handling syntax. `try` wraps code that might raise an exception. `except ValidationError as validation_error:` catches only `ValidationError` exceptions and binds the exception object to the name `validation_error`. If a different exception were raised (e.g., `ImportError`), it would not be caught here and would propagate up.

`print(validation_error)` — prints the error. Pydantic's `ValidationError` has a detailed `__str__` method. The output shows:
- The number of errors (2)
- The model that failed validation (`WorkOrder`)
- For each error: which field failed, what the error is, what the actual input value was, what type it was

This error format is exactly what FastAPI returns when a request body fails validation — the 422 response body you saw in Lesson 3 is Pydantic's `ValidationError` formatted as JSON.

**CS lens — structured errors.** Pydantic's `ValidationError` is not a single string. It contains a list of error objects, each with `loc` (location: which field), `msg` (human-readable message), `type` (machine-readable error code), and `input` (the value that failed). This structure allows the API client to receive the error and display which specific fields are invalid — not just "your request was bad." This is the difference between a usable API error and an opaque one.

**SE lens — catch specific exceptions, not all exceptions.** `except ValidationError` catches only Pydantic validation errors — not every possible exception. Writing `except Exception:` (catching everything) is almost always wrong: it hides bugs by catching exceptions you did not expect and making them disappear silently. Catch the specific exception class you expect; let everything else propagate so you notice unexpected failures.

**What breaks without this:** If you use `WorkOrder` without a `try/except` and validation fails, the `ValidationError` propagates up the call stack. In a FastAPI route handler, FastAPI catches it automatically and returns a 422 response. But if your code creates `WorkOrder` objects outside a route handler — in a test, in a startup script — an uncaught `ValidationError` crashes the program. Always handle validation errors explicitly at the point where you create Pydantic objects from untrusted data.

---

### 4. Create and update models — the `model_dump` and `model_copy` methods

**The problem:** You have a model that validates data. You need to convert it to a dict (to store in the in-memory list) and create updated copies (for the PUT endpoint).

Add to `validate_scratch.py`:

```python
# Convert to dict
order = WorkOrder(id=1, title="Fix conveyor belt", status="open", priority="high")
order_dict = order.model_dump()
print(f"As dict: {order_dict}")
print(f"Type: {type(order_dict)}")

# Create an updated copy
updated_order = order.model_copy(update={"status": "in_progress"})
print(f"Original: {order.status}")
print(f"Updated: {updated_order.status}")
```

Expected output:
```
As dict: {'id': 1, 'title': 'Fix conveyor belt', 'status': 'open', 'priority': 'high', 'assigned_to': None}
Type: <class 'dict'>
Original: open
Updated: in_progress
```

**Walkthrough:**

`order.model_dump()` — converts the Pydantic model to a plain Python dict. Every field becomes a dict key; every field value becomes a dict value. The returned object is a standard `dict` — you can use it anywhere a dict is expected. This is how you store Pydantic-validated data in the in-memory list and how FastAPI serialises responses to JSON.

`type(order_dict)` — the built-in `type()` function returns the type of any Python object. `type(order_dict)` returns `<class 'dict'>`, confirming the returned value is a plain dict, not a Pydantic model.

`order.model_copy(update={"status": "in_progress"})` — creates a new `WorkOrder` with the same values as `order`, except that `status` is replaced with `"in_progress"`. The original `order` is unchanged — Pydantic models are immutable by default (in Pydantic v2). The `update` argument is a dict of field overrides. The copy is validated — if you pass an invalid update (`update={"status": 999}`), Pydantic raises `ValidationError`.

**CS lens — immutability and the copy-on-write pattern.** Pydantic v2 models are immutable by default — you cannot write `order.status = "in_progress"`. This is the **immutability principle**: once an object is created, it does not change. To "change" it, you create a new object with the desired values. Immutability prevents bugs where a function modifies an object that is shared by other code, causing unexpected changes in distant parts of the system. `model_copy` is a **copy-on-write** operation: it makes a copy with the specified writes applied.

**SE lens — models vs dicts.** Your in-memory store uses dicts because the list was created before Pydantic. The CRUD endpoints in Lesson 3 will receive Pydantic models from FastAPI (validated request bodies), then call `model_dump()` to store them as dicts. This is the boundary: incoming data is a Pydantic model (validated), stored data is a dict (serialisable). Outgoing data will also be a Pydantic model when FastAPI serialises the response. The model is the trust boundary; the dict is the storage representation.

**What breaks without this:** Calling `.dict()` instead of `.model_dump()` — the Pydantic v1 method — works in Pydantic v2 but produces a deprecation warning. Pydantic v3 will remove it. Use `.model_dump()`. Similarly, `.copy(update=...)` (v1) should be `.model_copy(update=...)` (v2).

---

### 5. Create models for input (without ID) and output (with ID)

**The problem:** When creating a new work order, the client sends the data — title, status, priority — but not the ID. The server assigns the ID. If you use `WorkOrder` for both input and output, the client is required to send an ID that the server ignores. This is confusing and incorrect.

The solution is **two models**: one for input (no ID), one for output (with ID).

Update `backend/models.py`:

```python
from pydantic import BaseModel
from typing import Optional

class WorkOrderCreate(BaseModel):
    title: str
    status: str
    priority: str
    assigned_to: Optional[str] = None

class WorkOrder(WorkOrderCreate):
    id: int
```

**Walkthrough:**

`class WorkOrderCreate(BaseModel):` — the input model. No `id` field. The client sends this when creating a new order.

`class WorkOrder(WorkOrderCreate):` — the output model. Inherits all fields from `WorkOrderCreate` and adds `id: int`. `WorkOrder` is a `WorkOrderCreate` plus an ID.

**Class inheritance** in Pydantic works as in regular Python: the subclass inherits all fields from the parent. `WorkOrder` has the fields `title`, `status`, `priority`, `assigned_to` (from `WorkOrderCreate`) plus `id` (defined directly on `WorkOrder`). Every `WorkOrder` is a `WorkOrderCreate` — it satisfies the same contract plus more.

In `validate_scratch.py`, test this:

```python
from models import WorkOrderCreate, WorkOrder

create_input = WorkOrderCreate(
    title="New pump maintenance",
    status="open",
    priority="medium"
)
print(f"Input: {create_input.model_dump()}")

stored = WorkOrder(id=10, **create_input.model_dump())
print(f"Stored: {stored.model_dump()}")
```

`**create_input.model_dump()` — the `**` operator (double asterisk) is the **dictionary unpacking operator**. `WorkOrder(id=10, **create_input.model_dump())` is equivalent to `WorkOrder(id=10, title="New pump maintenance", status="open", priority="medium", assigned_to=None)`. It unpacks the dict into keyword arguments.

**CS lens — inheritance as type subsumption.** Every `WorkOrder` is a `WorkOrderCreate` — any code that accepts a `WorkOrderCreate` can accept a `WorkOrder`. This is the **Liskov Substitution Principle**: a value of a subtype can be used wherever a value of the parent type is expected. FastAPI uses this when it generates the OpenAPI schema: the input schema for POST uses `WorkOrderCreate` (no `id`); the response schema uses `WorkOrder` (with `id`). Two different schemas, one relationship.

**SE lens — separating input from output shapes.** Input shapes and output shapes are rarely identical in real APIs. Input has no server-assigned fields (id, created_at). Output includes them. Input may accept partial updates; output always has all fields. Using separate models for input and output makes each contract precise and prevents clients from accidentally sending fields they should not (or receiving fields they should not). Every professional API has this separation.

**What breaks without this:** Using `WorkOrder` for both input and output in FastAPI means FastAPI's generated documentation tells clients they must send an `id` when creating a work order. Clients either invent an `id` (which the server then ignores, a silent data mismatch) or are confused about what to send.

---

## Connect the pieces

`models.py` now contains two classes: `WorkOrderCreate` (input) and `WorkOrder` (output). In Lesson 3, you will use these models in FastAPI route handlers: `@app.post("/orders")` will accept a `WorkOrderCreate` as its request body (FastAPI validates it automatically), assign an ID, and return a `WorkOrder`. The validation that Pydantic provides means every route handler can trust that the data it receives has the correct shape — the checking is done before the handler runs.

The `ValidationError` format you saw in this lesson is exactly what FastAPI returns as its 422 response. When a client sends invalid JSON, FastAPI's response body is Pydantic's `ValidationError` formatted as JSON.

---

## What breaks without this

**`ValidationError` in production unexpectedly:** A field that passed validation in development fails in production because real user input includes edge cases your test data did not. Example: `priority: str` accepts any string, but your UI only sends "low", "medium", or "high". A direct API call sends "URGENT". The model accepts it (it is a valid string), but the logic breaks. Fix: use `Literal` type annotations to restrict the allowed values: `priority: Literal["low", "medium", "high"]`.

**`AttributeError: 'dict' object has no attribute 'title'`:** You passed a dict to a function expecting a `WorkOrder`. After the boundary (the route handler), use Pydantic models with dot notation. Before the boundary or in storage, use dicts.

---

## Definition of done

- [ ] `WorkOrderCreate` and `WorkOrder` are defined in `backend/models.py`
- [ ] `python3 validate_scratch.py` runs without errors and shows the expected validation output
- [ ] You deliberately triggered a `ValidationError` and read its error format
- [ ] You can explain the difference between `WorkOrderCreate` and `WorkOrder` and why two models are needed
- [ ] You can explain what `Optional[str] = None` means
- [ ] You can explain what `model_dump()` returns and when you would use it
- [ ] You can explain what `**dict` does in a function call

**Git commit:**

```
git add backend/models.py backend/validate_scratch.py
git commit -m "Add Pydantic models: WorkOrderCreate and WorkOrder with runtime validation, tested against valid and invalid inputs"
```
