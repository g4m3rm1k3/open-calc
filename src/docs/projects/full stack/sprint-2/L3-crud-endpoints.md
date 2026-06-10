# Sprint 2 · Lesson 3 — CRUD endpoints: every HTTP verb

## What you will build

By the end of this lesson, your FastAPI server has five endpoints: list all orders, get one by ID, create a new order, update an existing order, and delete an order. All data is stored in an in-memory list. The interactive docs at `/docs` document every endpoint. React can read from and write to this API. You will understand what each HTTP verb means, why it means it, and what status code each operation returns.

---

## What you need to know first

- Sprint 2 L1: Python dicts, lists, find-by-id, append, filter.
- Sprint 2 L2: `WorkOrder`, `WorkOrderCreate` Pydantic models, `model_dump()`.
- Sprint 1 L3: FastAPI route handlers, decorators, path parameters, `HTTPException`.

**Concepts carried forward:** `@app.get`, path parameters, Pydantic models, `model_dump()`, HTTP request/response cycle, status codes.

---

## The lesson

---

### 1. Set up the full `main.py`

**The problem:** You need a clean `main.py` that imports the Pydantic models and sets up the in-memory store.

Replace `backend/main.py` with:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import WorkOrder, WorkOrderCreate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

work_orders: list[WorkOrder] = []
next_id: int = 1
```

**Walkthrough:**

`from fastapi import FastAPI, HTTPException` — two named imports from FastAPI. `FastAPI` is the application class. `HTTPException` is a class you raise to return an HTTP error response with a specific status code and message. You will use it to return 404 when a work order is not found.

`from models import WorkOrder, WorkOrderCreate` — imports both Pydantic models from `models.py`. The `models` module is `backend/models.py`. Python resolves this import by looking for a file named `models.py` in the same directory as `main.py`.

`work_orders: list[WorkOrder] = []` — the in-memory store. `list[WorkOrder]` is a **generic type annotation** — it says this is a list where every element is a `WorkOrder`. This is Pylance's documentation: whenever code accesses `work_orders[0]`, Pylance knows the result is a `WorkOrder`. The initial value is an empty list.

`next_id: int = 1` — a counter for assigning IDs. Every time a new order is created, this variable is used for the new order's ID and then incremented. This is a simple ID strategy for an in-memory store. A database would use an auto-incrementing primary key instead.

**CS lens — module-level state.** `work_orders` and `next_id` are **module-level variables** — they live at the top level of `main.py`, outside any function or class. Every route handler in the same process shares the same `work_orders` list and `next_id` counter. This works because uvicorn runs your FastAPI app as a single Python process. In production, multiple uvicorn workers run simultaneously (for performance) and each has its own memory — module-level state would not be shared between them. This is one of several reasons the in-memory store cannot be used in production.

**SE lens — the in-memory store as a deliberate simplification.** Using a list instead of a database is a deliberate choice at this stage: it keeps the focus on HTTP semantics, Pydantic validation, and FastAPI routing without adding database complexity. This is the **strangler fig pattern** applied to learning: replace one thing at a time, understanding each layer before the next. In Sprint 3 you will replace the list with Postgres without changing a single route handler — because the route handlers work with Pydantic models, not with the storage mechanism.

---

### 2. GET all orders

**The problem:** The client needs to retrieve the full list of work orders.

Add to `main.py`:

```python
@app.get("/orders", response_model=list[WorkOrder])
def list_orders():
    return work_orders
```

Restart uvicorn (or it auto-reloads). Visit `http://localhost:8000/orders`. Expected output: `[]` (empty list, no orders yet).

**Walkthrough:**

`response_model=list[WorkOrder]` — the `response_model` parameter on the decorator tells FastAPI what the response should look like. FastAPI uses this to:
1. Validate the return value matches the model
2. Filter the return value — if your `WorkOrder` object had internal fields (like a raw database row), `response_model` ensures only the declared fields are sent to the client
3. Generate the OpenAPI schema for the response

`def list_orders():` — no parameters. This route takes no path parameters, no query parameters, and no request body. It returns the entire `work_orders` list.

`return work_orders` — returns the list. FastAPI serialises each `WorkOrder` in the list to JSON using Pydantic's `.model_dump()` logic internally. The HTTP response body is a JSON array.

**HTTP semantics:**
- **Method:** `GET`
- **Status code:** `200 OK` (FastAPI's default for successful GET)
- **Body:** JSON array of work orders

**CS lens — `GET` as a safe, idempotent operation.** `GET` is **safe** (it does not modify data) and **idempotent** (calling it 10 times has the same effect as calling it once). Safety means the browser can pre-fetch GET requests, cache them, and retry them without consequences. Idempotency means load balancers can safely retry failed GET requests. These properties are not enforced by HTTP — they are contracts you make by implementing `GET` correctly. Violating them (e.g., deleting data on a GET request) breaks browser caching, search engine indexing, and monitoring tools.

**What breaks without this:** If you forget `response_model`, FastAPI serialises the return value as-is, which works fine. The benefit of `response_model` is the filtering and the OpenAPI schema generation — without it, the docs page shows no response schema.

---

### 3. GET one order by ID

**The problem:** The client needs to retrieve a specific work order by its ID. If the ID does not exist, the server must return 404.

Add to `main.py`:

```python
@app.get("/orders/{order_id}", response_model=WorkOrder)
def get_order(order_id: int):
    for order in work_orders:
        if order.id == order_id:
            return order
    raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
```

**Walkthrough:**

`@app.get("/orders/{order_id}")` — the `{order_id}` path parameter matches any integer in that URL position. A GET to `/orders/42` extracts `42` and passes it to the function.

`def get_order(order_id: int):` — FastAPI reads the `: int` annotation and converts the extracted string to an integer before calling the function. If the URL contains `/orders/hello`, FastAPI returns 422 before calling this function.

`for order in work_orders:` — scans the list. The `order` variable is a `WorkOrder` object (Pylance knows this from the `list[WorkOrder]` annotation on `work_orders`). Dot notation: `order.id`, not `order["id"]`.

`if order.id == order_id:` — compares the order's `id` attribute to the requested `order_id`. Both are `int`, so `==` is an integer comparison.

`return order` — returns immediately when found. FastAPI serialises the `WorkOrder` to JSON.

`raise HTTPException(status_code=404, detail=f"Order {order_id} not found")` — raises a FastAPI exception. `raise` is Python's keyword for throwing an exception. `HTTPException` is a special FastAPI exception that, when raised, stops normal route execution and returns an HTTP response with the specified status code and detail message. `status_code=404` means **Not Found** — the standard HTTP response when a resource does not exist at the requested URL.

**Walkthrough of the HTTP response for a missing order:** FastAPI catches the `HTTPException` before it propagates to the user. It creates an HTTP response: status code 404, body `{"detail": "Order 99 not found"}`. The browser receives this response. In the Network tab, the status code is red (404). The response body is the JSON object.

**CS lens — sequential search with early exit.** The loop is a **linear search with early exit** — it stops the moment it finds a match rather than scanning the entire list. In the best case (first item matches), it is O(1). In the worst case (last item or not found), it is O(n). The early exit is important: a loop without `return order` inside the body would scan the entire list every time, even when the first item matches.

**SE lens — 404 vs 500.** `404 Not Found` is not an error in the programming sense — it is a valid, expected outcome when a client requests a resource that does not exist. The server correctly processed the request and correctly determined the resource is absent. `500 Internal Server Error` would mean something went wrong in the server's logic. Conflating these — returning 500 for "not found" — misrepresents the situation to every tool monitoring the server: dashboards would alert on 500s as server failures when they are actually normal "not found" responses from clients typing wrong IDs.

**What breaks without this:** If you forget `raise HTTPException` and the loop completes without finding a match, the function returns `None` implicitly. FastAPI tries to serialise `None` as a `WorkOrder` response, encounters `None` instead of a `WorkOrder` object, and raises an internal error — returning 500 instead of 404. The fix is always the explicit `raise HTTPException` for not-found cases.

---

### 4. POST — create a new order

**The problem:** The client needs to submit data to create a new work order. The server assigns an ID and stores it.

Add to `main.py`:

```python
@app.post("/orders", response_model=WorkOrder, status_code=201)
def create_order(order_data: WorkOrderCreate):
    global next_id
    new_order = WorkOrder(id=next_id, **order_data.model_dump())
    work_orders.append(new_order)
    next_id += 1
    return new_order
```

**Walkthrough:**

`@app.post("/orders", ...)` — registers a `POST` handler for `/orders`. The same path as `GET /orders` but a different HTTP method — these are different routes.

`status_code=201` — overrides the default status code. `201 Created` is the HTTP standard for "a new resource was successfully created." The created resource is included in the response body. FastAPI defaults to `200` for most routes; you explicitly set `201` for creation routes.

`def create_order(order_data: WorkOrderCreate):` — the parameter `order_data: WorkOrderCreate` tells FastAPI to read the **request body**, parse it as JSON, and validate it against the `WorkOrderCreate` schema. If the body is missing, malformed JSON, or fails validation, FastAPI returns 422 automatically — before this function is called. If all validation passes, `order_data` is a valid `WorkOrderCreate` object.

`global next_id` — the `global` keyword tells Python that this function intends to modify the module-level variable `next_id`. Without `global`, Python would create a local variable named `next_id` inside the function, leaving the module-level `next_id` unchanged. This is Python's scoping rule: reading a module-level variable does not require `global`; writing to it does.

`WorkOrder(id=next_id, **order_data.model_dump())` — creates a `WorkOrder` from the input data plus the assigned ID. `order_data.model_dump()` converts the `WorkOrderCreate` to a dict: `{"title": "...", "status": "...", "priority": "...", "assigned_to": None}`. `**` unpacks that dict into keyword arguments. Combined: `WorkOrder(id=1, title="...", status="...", priority="...", assigned_to=None)`.

`work_orders.append(new_order)` — adds the new `WorkOrder` to the in-memory list.

`next_id += 1` — increments the ID counter. The next created order will have ID 2.

`return new_order` — returns the full `WorkOrder` (with ID). The client receives the created resource including its server-assigned ID.

**CS lens — POST as non-idempotent.** `POST` is **not idempotent** — calling it twice creates two resources. This contrasts with `PUT` (next section) which is idempotent. The HTTP specification says `POST` creates a subordinate resource at the given URL. Because POST is not idempotent, browsers warn before resending POST requests after a page reload ("Resubmit form data?"). Load balancers should not automatically retry failed POST requests. These behaviours depend on the contract `POST` makes.

**SE lens — assigning ID on the server.** The client does not assign IDs — the server does. This is a deliberate design choice. If clients assigned their own IDs, two clients could independently create orders with the same ID, causing conflicts. Server-assigned IDs are generated by a single authoritative source (the server, or the database), guaranteeing uniqueness. A database auto-increment primary key is the standard implementation in Sprint 3.

**What breaks without this:** If you forget `global next_id` and two orders are created, both receive ID 1. The `next_id` module-level variable was never updated. The in-memory list now has two orders with the same ID; `GET /orders/1` returns the first one found. Data integrity is silently broken.

---

### 5. PUT — update an existing order

**The problem:** The client needs to update an existing work order — change its status, reassign it, update its priority.

Add to `main.py`:

```python
@app.put("/orders/{order_id}", response_model=WorkOrder)
def update_order(order_id: int, order_data: WorkOrderCreate):
    for index, order in enumerate(work_orders):
        if order.id == order_id:
            updated = WorkOrder(id=order_id, **order_data.model_dump())
            work_orders[index] = updated
            return updated
    raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
```

**Walkthrough:**

`@app.put("/orders/{order_id}")` — `PUT` to a specific resource URL. The convention: `PUT /orders/{id}` replaces the entire resource identified by `id`.

`def update_order(order_id: int, order_data: WorkOrderCreate):` — two parameters: `order_id` comes from the path (FastAPI extracts it from the URL), and `order_data` comes from the request body (FastAPI reads and validates the JSON body). FastAPI distinguishes these by type: path parameters are simple types (`int`, `str`); request bodies are Pydantic models.

`for index, order in enumerate(work_orders):` — `enumerate` is a built-in Python function. It wraps an iterable and yields `(index, item)` tuples on each iteration. `enumerate(work_orders)` yields `(0, first_order)`, then `(1, second_order)`, etc. This gives you the position (`index`) alongside the item (`order`) — necessary here because you need to replace the item at a specific position.

`work_orders[index] = updated` — replaces the item at position `index` with the new `WorkOrder`. This is in-place mutation of the list.

`WorkOrder(id=order_id, **order_data.model_dump())` — creates a fresh `WorkOrder` with the existing ID but new field values from the request body. `PUT` semantics mean the entire resource is replaced — all fields are updated to the values in the request body. Partial updates (only some fields) use `PATCH`, which you will not implement in this sprint.

**CS lens — `enumerate` as indexed iteration.** `for index, item in enumerate(collection):` is the Python idiom for when you need both the index and the item. The alternative — `for i in range(len(work_orders)):` — computes the length upfront and accesses items by index. `enumerate` is preferred because it expresses intent ("iterate with index tracking") rather than mechanics. Both are O(n).

**SE lens — `PUT` semantics: full replacement.** `PUT` replaces the entire resource. If the current order has 5 fields and the client sends a body with 4 fields (omitting `assigned_to`), the `PUT` result has 4 fields — `assigned_to` is reset to its default (`None`). This is correct `PUT` behaviour: the client is responsible for sending the complete resource representation. If you want to change only specific fields without sending the full resource, `PATCH` is the correct method. The distinction matters because `PUT` is idempotent (calling it 10 times with the same body has the same result as calling it once) — partial `PUT` breaks idempotency.

**What breaks without this:** Using `work_orders[index] = updated` without finding `index` first — you need both the item (to verify the ID) and the index (to replace it). If you only have the item, you cannot replace it by position. If you used a dict keyed by ID (`work_orders_by_id`), you could do `work_orders_by_id[order_id] = updated` — O(1) replacement. The list requires O(n) scan.

---

### 6. DELETE — remove an order

**The problem:** The client needs to remove a work order permanently.

Add to `main.py`:

```python
@app.delete("/orders/{order_id}", status_code=204)
def delete_order(order_id: int):
    global work_orders
    original_length = len(work_orders)
    work_orders = [order for order in work_orders if order.id != order_id]
    if len(work_orders) == original_length:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
```

**Walkthrough:**

`@app.delete("/orders/{order_id}", status_code=204)` — `DELETE` to a specific resource. `status_code=204` is **No Content** — the standard HTTP response for a successful deletion. 204 means "the operation succeeded and there is nothing to return." The response body is empty.

`global work_orders` — the filter creates a new list and rebinds `work_orders`. Writing to the module-level `work_orders` requires `global`.

`original_length = len(work_orders)` — captures the count before filtering. After filtering, if the length is the same, the order was not found — the filter removed nothing.

`work_orders = [order for order in work_orders if order.id != order_id]` — the filter-by-exclusion deletion pattern from Lesson 1. This builds a new list without the order whose ID matches.

`if len(work_orders) == original_length: raise HTTPException(...)` — if the length did not change, the order did not exist. Return 404. This is the "not found" check — necessarily after the filter, because you learn whether the item existed by whether the filter changed anything.

**No return statement:** When `status_code=204` and the operation succeeds, returning `None` is correct — there is nothing to return. FastAPI produces an empty response body, which is correct for 204.

**CS lens — delete as set difference.** The filter `[order for order in work_orders if order.id != order_id]` computes the **set difference**: the original list minus any element with the given ID. This is O(n) because it scans every item. A list-based store has no better option. A database `DELETE FROM work_orders WHERE id = ?` also scans an index but finishes in O(log n) due to the primary key index.

**SE lens — `204 No Content` as a semantic contract.** Returning `204` instead of `200` communicates clearly: "deletion succeeded and there is no resource to return." Clients that receive `204` know not to parse a response body. Clients that receive `200` expect a body. Returning `200` with an empty body for deletions is incorrect — it breaks the contract.

**What breaks without this:** Returning `204` but accidentally including a response body: some HTTP clients ignore the body for 204 responses; others raise errors because 204 is defined as having no body. FastAPI handles this correctly when `status_code=204` is set — it produces an empty body regardless of what the function returns.

---

### 7. Test all five endpoints

**The problem:** You have five endpoints. Verify each one before connecting React.

Start uvicorn:
```
uvicorn main:app --reload
```

Open `http://localhost:8000/docs` and test each endpoint using the "Try it out" button.

**Create two orders** (POST `/orders`):
```json
{"title": "Fix conveyor belt", "status": "open", "priority": "high"}
```
```json
{"title": "Lubricate pump", "status": "open", "priority": "medium"}
```
Both should return `201` with the created order including an `id`.

**List all orders** (GET `/orders`): Should return both orders with IDs 1 and 2.

**Get one order** (GET `/orders/1`): Should return the first order.

**Get missing order** (GET `/orders/99`): Should return 404.

**Update order 1** (PUT `/orders/1`):
```json
{"title": "Fix conveyor belt", "status": "in_progress", "priority": "high"}
```
Should return the updated order with `status: "in_progress"`.

**Delete order 2** (DELETE `/orders/2`): Should return 204 with empty body.

**List again** (GET `/orders`): Should show only order 1.

**Walkthrough of the test sequence:** The test sequence exercises every endpoint in an order that validates them together — not just individually. Creating before listing confirms creation works. Getting a specific order confirms the ID returned by POST is valid. Getting a missing ID confirms 404 is returned. Updating confirms the change persists. Deleting confirms the filter works. Listing after delete confirms the list is shorter. This is **integration testing**: testing multiple components working together, not just in isolation.

**CS lens — CRUD as a complete data lifecycle.** Create, Read, Update, Delete — these four operations cover the full lifecycle of a data entity. Every database, every ORM, every API framework provides CRUD as the baseline. The endpoints you built mirror the SQL operations: `POST` → `INSERT`, `GET /orders` → `SELECT *`, `GET /orders/{id}` → `SELECT WHERE id = ?`, `PUT` → `UPDATE`, `DELETE` → `DELETE WHERE id = ?`. In Sprint 3 you will replace each route handler's list operation with the equivalent SQL operation — the HTTP layer does not change.

**SE lens — testing against the docs page.** The `/docs` page is not just documentation — it is an interactive testing tool. Using it to test each endpoint before writing React code isolates the backend: if the backend does not work, the frontend integration will not work, and debugging the integration is harder than debugging the backend alone. Fix backend problems in the backend; fix frontend problems in the frontend; fix integration problems only after both halves work independently.

---

## Connect the pieces

Your CRUD API is complete. The five endpoints map to the four standard operations:

| Endpoint               | Method   | Operation | Status |
|------------------------|----------|-----------|--------|
| `GET /orders`          | GET      | List all  | 200    |
| `GET /orders/{id}`     | GET      | Get one   | 200    |
| `POST /orders`         | POST     | Create    | 201    |
| `PUT /orders/{id}`     | PUT      | Update    | 200    |
| `DELETE /orders/{id}`  | DELETE   | Delete    | 204    |

In Lesson 4, React will call each of these endpoints to display the list, show a detail view, submit a create form, and delete an order. In Sprint 3, every line inside these route handler functions — the list scan, the append, the filter — will be replaced with database queries. The route signatures, the Pydantic models, the status codes, and the error handling remain unchanged.

---

## What breaks without this

**Two routes with conflicting paths:** If you define `GET /orders/stats` and `GET /orders/{order_id}` in that order, FastAPI tries `/orders/stats` first — the literal path wins over the parameterised one, which is correct. If you define `GET /orders/{order_id}` first, FastAPI matches `stats` as an `order_id`, fails the `int` coercion, and returns 422. Fix: define specific literal paths before parameterised paths.

**`global` missing on `work_orders` in `delete_order`:** Reassigning `work_orders = [...]` without `global` creates a local variable. The module-level list is unchanged. Orders are never deleted. The fix is to add `global work_orders` at the top of the function body.

---

## Definition of done

- [ ] All five endpoints (`GET /orders`, `GET /orders/{id}`, `POST /orders`, `PUT /orders/{id}`, `DELETE /orders/{id}`) return the correct status codes and bodies
- [ ] `GET /orders/99` returns 404 with `{"detail": "Order 99 not found"}`
- [ ] `POST /orders` returns 201 with the created order including a server-assigned `id`
- [ ] `DELETE /orders/{id}` returns 204 with no body
- [ ] You tested every endpoint using `/docs` before moving to Lesson 4
- [ ] You can explain why `PUT` is idempotent and `POST` is not
- [ ] You can explain the difference between 404 and 500
- [ ] You can explain what `enumerate` returns and why you need it for the update route

**Git commit:**

```
git add backend/main.py
git commit -m "Add CRUD endpoints for work orders: all five HTTP verbs with Pydantic validation, correct status codes, and 404 handling"
```
