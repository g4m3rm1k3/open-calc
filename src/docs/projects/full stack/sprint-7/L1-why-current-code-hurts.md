# Sprint 7 · Lesson 1 — Why the current code structure will hurt

## What you will build

By the end of this lesson, you will have identified four specific structural problems in the current codebase using the language of coupling, cohesion, and separation of concerns. You will read code you wrote four sprints ago and see why it will resist change. The lesson does not introduce any new libraries — it introduces a way of reading code that reveals structural debt. Lessons 2–4 fix what this lesson diagnoses.

---

## What you need to know first

- All of Sprint 2 and Sprint 3: the current route handlers, SQLAlchemy queries, Pydantic models.

---

## The lesson

---

### 1. Read the current `main.py` with fresh eyes

**The problem:** The work order API was built correctly — it works, passes tests, handles auth, enforces ownership. But "works" is not the same as "easy to change." As requirements evolve, code that was quick to write becomes slow to change. This is **technical debt**: the gap between the code you wrote and the code you would write if you knew then what you know now.

Open `backend/main.py`. Notice what is all in one file:

- FastAPI app initialisation
- Route definitions (HTTP methods, paths, request/response models)
- SQLAlchemy database queries
- Business logic (ownership checks, error decisions)
- Authentication wiring
- CORS and security middleware

Every part of the application lives in one file. When any aspect changes, you open `main.py`. When you write tests, tests depend on everything in `main.py`. When a new feature arrives, you add more to `main.py`.

This is not hypothetical future pain. You can see the pain already:

```python
@app.get("/orders/{order_id}", response_model=WorkOrder)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    if order.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to access this order")
    return order
```

**What is mixed here:**
1. HTTP concerns: `@app.get(...)`, `HTTPException`, `response_model`
2. Database concerns: `db.query(WorkOrderModel).filter(...)`
3. Business concerns: "does this user own this order?"

These three things change for different reasons:

- HTTP concerns change when the API contract changes (versioning, new fields, different status codes)
- Database concerns change when the schema changes (new index, new column, different ORM)
- Business concerns change when the rules change ("admins can access all orders", "support can view but not edit")

When three things change for different reasons live in one function, every change touches the same function. A schema migration changes the function. An API versioning change changes the function. A business rule change changes the function. Each change risks breaking the other two.

**CS lens — coupling.** Two components are **coupled** if a change to one requires a change to the other. High coupling is the root cause of code that is hard to change: pulling one thread unravels others. The `get_order` function is tightly coupled to SQLAlchemy (if you switch ORMs, you rewrite route handlers), tightly coupled to the HTTP layer (if you move logic to a background job, it cannot call route handler code), and tightly coupled to the specific business rule (the 403 check).

**SE lens — cohesion.** **Cohesion** is how closely related a module's responsibilities are. A highly cohesive module does one thing. A low-cohesion module does many things. `main.py` is low-cohesion: HTTP routing + database access + business logic. Low cohesion is difficult to test (you cannot test business rules without setting up HTTP and database), difficult to reuse (you cannot call the ownership check from a background job), and difficult to understand (you must hold three mental models simultaneously).

---

### 2. Identify the four structural problems

**Problem 1: Route handlers know too much about the database.**

```python
order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
```

The route handler calls SQLAlchemy directly. To test the business logic (does 403 return when the user is not the owner?), you must provide a real or mocked SQLAlchemy session. The business logic is untestable in isolation — it is inseparable from the database layer.

If you want to add a Redis cache (return the order from cache if it was recently fetched), you must modify the route handler. The caching concern invades the routing concern.

**Problem 2: Business logic is scattered across route handlers.**

The ownership check `if order.owner_id != current_user.id: raise HTTPException(403)` appears in `get_order`, `update_order`, and `delete_order`. Any change to the ownership rule (e.g., "admins can bypass the check") requires the same change in three places. Three places means three chances to miss one.

Currently, `get_owned_order` was extracted as a helper function — this is a partial solution. But it still lives in `main.py`, still raises `HTTPException` (a web-layer concern), and still calls `db.query` (a database-layer concern). The responsibilities are mixed within the helper.

**Problem 3: `HTTPException` leaks into business logic.**

`raise HTTPException(status_code=403, detail="...")` is a web-layer concept — it is an HTTP response code. When this appears in an ownership check function, the ownership check is coupled to the HTTP layer. If you want to use the ownership check in a background job (a cron that audits orders), the job receives `HTTPException` — which is meaningless outside HTTP.

Business logic should raise domain exceptions (`OrderNotFoundError`, `PermissionDeniedError`) and the HTTP layer should translate them into HTTP responses.

**Problem 4: Testing requires the full stack.**

To test "user cannot access another user's order", the current test:
- Creates database records directly
- Starts the TestClient (which runs the whole FastAPI app)
- Makes HTTP requests
- Checks HTTP status codes

This is integration testing — it tests the whole stack. It is correct and valuable. But it cannot test just the business logic. If the ownership check had a subtle bug in a complex condition, the integration test might not cover every branch. A unit test of the business logic function in isolation would be simpler and faster.

With the current structure, there is no "business logic function" to unit test. The logic is inside the route handler. The route handler requires the full stack to run.

**CS lens — separation of concerns.** Separation of concerns is the principle that distinct problems should be handled by distinct parts of a system. The concerns in this codebase are: HTTP routing (accepting requests, returning responses), data access (querying the database), and business logic (the rules that govern what the application does). These three concerns currently overlap in `main.py`. Lessons 2 and 3 separate them into distinct layers.

**SE lens — the cost of change.** The measure of good architecture is not how the code looks today — it is how easily it changes. Ask: "if this requirement changes, how many files do I touch?" Good architecture minimises the number of files touched for any single change. Current structure: a schema change touches `orm_models.py`, `models.py`, `main.py`, and `conftest.py`. Future structure: a schema change touches `orm_models.py` and the repository layer only. Route handlers do not change when the schema changes, because route handlers no longer contain SQL.

---

### 3. The solution preview: three layers

The fix is **layered architecture**: separate the three concerns into three distinct layers, each with a clearly defined responsibility.

```
HTTP Layer (routes)       — accept requests, validate input, return responses
    ↓ calls
Service Layer             — business logic, domain rules, orchestration
    ↓ calls
Repository Layer          — data access, database queries, no business logic
```

Each layer:
- Depends only on the layer below it (routes call services; services call repositories)
- Does not depend on the layer above (repositories do not know about HTTP)
- Has a single responsibility

**What changes:**

Route handlers become thin: accept request, call service, return response. No SQL queries. No business rules. No ownership checks.

Service functions contain business rules: "can this user access this order?", "set the owner on creation", "validate the title is not empty". No database queries. No HTTP response codes.

Repository functions contain SQL: "find order by ID", "find all orders by owner", "save order". No business rules. No HTTP.

This is the **Repository Pattern** (Lesson 2) and **Service Layer** (Lesson 3). They are not new concepts — they are the standard architecture for applications that separate persistence from business logic. Spring Boot, Django, Rails, and Laravel all provide variants of this structure.

**CS lens — abstraction levels.** The three layers correspond to three levels of abstraction: HTTP (protocol level), business (domain level), data (persistence level). Each level speaks a different language. HTTP speaks in request/response, status codes, headers. Business speaks in work orders, owners, permissions. Data speaks in queries, transactions, rows. Mixing levels forces you to translate between them constantly — every function handles three languages. Separating levels means each function speaks one language cleanly.

---

### 4. Recognise the pattern in production codebases

The current structure is not wrong for a learning project — it is normal for an early-stage codebase. Every production codebase started the same way. The inflection point where separation of concerns becomes worth the overhead is: when a second feature needs the same business rule, or when a test needs to verify business logic without the full stack, or when a requirement changes and you want to change one layer without touching others.

**Real-world connection:** Django's architecture built this separation in from the start: Models (data layer), Views (HTTP layer), and the space in between where Django encourages adding Services or Managers (business layer). FastAPI deliberately does not prescribe structure — it gives you the tools; the architecture is your choice. That flexibility is appropriate for a lean API. The Repository/Service pattern is the standard choice when the codebase outgrows its initial structure.

**SE lens — architecture is a bet on the future.** Layered architecture requires more code than the current approach. It pays off when requirements change. If your requirements are stable and the application is small, the current structure is fine. The decision to refactor to layers is a bet: "the requirements will change, and the refactoring cost now is less than the accumulated change cost without it." The tests you wrote in Sprint 5 are what makes refactoring safe: you will refactor the code in Lessons 2–3 and know it is still correct because the tests pass.

---

## Connect the pieces

This lesson named four structural problems:
1. Route handlers contain SQLAlchemy queries
2. Business logic (ownership check) duplicated across route handlers
3. `HTTPException` (HTTP layer) inside business logic
4. No way to unit-test business logic in isolation

Lesson 2 introduces the Repository Pattern: extracting all database access into a dedicated class. Lesson 3 introduces the Service Layer: extracting all business logic into a dedicated module. Lesson 4 applies SOLID principles to verify the refactored structure.

---

## Definition of done

- [ ] You can point to a specific line in `main.py` and explain which concern it belongs to (HTTP, business, or data)
- [ ] You can explain coupling using the `get_order` function as the example
- [ ] You can explain why `raise HTTPException(403)` inside `get_owned_order` is a layering violation
- [ ] You can explain what the three layers are and what each one is responsible for
- [ ] You can explain why the test suite from Sprint 5 makes this refactoring safe

No git commit for this lesson — it is pure analysis. The code change begins in Lesson 2.
