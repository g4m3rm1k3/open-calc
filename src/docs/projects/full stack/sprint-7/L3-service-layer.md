# Sprint 7 · Lesson 3 — The Service Layer

## What you will build

By the end of this lesson, all business logic is extracted into `WorkOrderService`. The service handles: ownership verification (raising domain exceptions), creation with mandatory `owner_id`, and update/delete authorisation. Route handlers become three-line functions: receive request, call service, return response. `HTTPException` appears only in route handlers. The service can be unit-tested with an `InMemoryWorkOrderRepository` in milliseconds, without running FastAPI or a database.

---

## What you need to know first

- Sprint 7 L1: What belongs in each layer (HTTP, business, data).
- Sprint 7 L2: `WorkOrderRepository` Protocol, `SQLAlchemyWorkOrderRepository`, domain signals (None, bool).

---

## The lesson

---

### 1. Define domain exceptions

**The problem:** The service layer contains business logic. When a work order is not found or a user lacks permission, the service needs to signal failure. But it cannot use `HTTPException` — that is a web-layer concept. The service layer must be usable from HTTP handlers, background jobs, CLI scripts, and tests — none of which should receive an HTTP response object.

The solution: **domain exceptions**. Raise Python exceptions with meaningful names. The HTTP layer catches them and converts them to HTTP responses.

Add to a new file `backend/exceptions.py`:

```python
class OrderNotFoundError(Exception):
    def __init__(self, order_id: int):
        self.order_id = order_id
        super().__init__(f"Order {order_id} not found")

class PermissionDeniedError(Exception):
    def __init__(self, message: str = "Not authorised to access this resource"):
        super().__init__(message)
```

**Walkthrough:**

`OrderNotFoundError(Exception)` — a custom exception class. Inheriting from `Exception` makes it a standard Python exception — catchable with `except OrderNotFoundError`.

`self.order_id = order_id` — the exception carries data. The caller can catch `OrderNotFoundError` and read `e.order_id` to include it in an error message.

`super().__init__(f"Order {order_id} not found")` — sets the default string representation. `str(e)` and `repr(e)` include this message.

`PermissionDeniedError` — raised when a user attempts to access a resource they do not own.

**CS lens — exception as a first-class value.** In Python, exceptions are objects. They can carry data (attributes), have inheritance hierarchies (catch `AppError` to catch all application errors), and be raised and caught across layers. A domain exception is part of the domain model: `OrderNotFoundError` says "this specific domain concept (order) was sought and not found." It is richer than `None` (which only signals absence) and independent of any layer (unlike `HTTPException`).

**SE lens — the translation boundary.** The HTTP layer is the place where domain language translates to HTTP language:

```
Domain: OrderNotFoundError → HTTP: 404 Not Found
Domain: PermissionDeniedError → HTTP: 403 Forbidden
```

This translation happens once, in route handlers. Not in the service. Not in the repository. Only in the HTTP layer. If you add a gRPC interface, it translates domain exceptions to gRPC status codes. The service code does not change. The mapping between domain errors and protocol errors is protocol-specific; keeping it in the protocol layer is correct.

---

### 2. Implement `WorkOrderService`

Create `backend/work_order_service.py`:

```python
from typing import Optional
from models import WorkOrderCreate
from exceptions import OrderNotFoundError, PermissionDeniedError
from repositories import WorkOrderRepository

class WorkOrderService:
    def __init__(self, repo: WorkOrderRepository):
        self.repo = repo

    def list_orders_for_user(self, user_id: int) -> list:
        return self.repo.get_all_for_user(user_id)

    def get_order(self, order_id: int, user_id: int):
        order = self.repo.get_by_id(order_id)
        if order is None:
            raise OrderNotFoundError(order_id)
        if self._get_owner_id(order) != user_id:
            raise PermissionDeniedError()
        return order

    def create_order(self, order_data: WorkOrderCreate, user_id: int):
        return self.repo.create(order_data, owner_id=user_id)

    def update_order(self, order_id: int, order_data: WorkOrderCreate, user_id: int):
        order = self.repo.get_by_id(order_id)
        if order is None:
            raise OrderNotFoundError(order_id)
        if self._get_owner_id(order) != user_id:
            raise PermissionDeniedError()
        return self.repo.update(order_id, order_data)

    def delete_order(self, order_id: int, user_id: int) -> None:
        order = self.repo.get_by_id(order_id)
        if order is None:
            raise OrderNotFoundError(order_id)
        if self._get_owner_id(order) != user_id:
            raise PermissionDeniedError()
        self.repo.delete(order_id)

    def _get_owner_id(self, order) -> int:
        if isinstance(order, dict):
            return order["owner_id"]
        return order.owner_id
```

**Walkthrough:**

`def __init__(self, repo: WorkOrderRepository)` — the service takes a `WorkOrderRepository` (the Protocol type). It does not know which implementation — `SQLAlchemyWorkOrderRepository` or `InMemoryWorkOrderRepository`. It only calls the methods defined in the Protocol.

`get_order(self, order_id: int, user_id: int)` — the complete business rule for reading an order: exists (or 404), owned by requester (or 403). Both conditions are checked here. The route handler calls this once and handles the exceptions.

`raise OrderNotFoundError(order_id)` — a domain exception. Not an HTTPException. The route handler will catch this and convert it.

`raise PermissionDeniedError()` — a domain exception. The route handler will catch this and return 403.

`_get_owner_id(self, order)` — a small adapter for the dual representation problem: SQLAlchemy ORM objects use `order.owner_id` (attribute access); the `InMemoryWorkOrderRepository` returns dicts using `order["owner_id"]` (key access). This adapter handles both. It is prefixed with `_` (private by convention — not part of the public API).

**What the service does NOT do:**
- No `db.query(...)` — no SQLAlchemy
- No `response_model=...` — no FastAPI
- No `HTTPException` — no HTTP layer
- No `Request` — no web framework

The service is a plain Python class with plain Python dependencies. It can run anywhere Python runs.

**CS lens — the service as a use-case orchestrator.** A service method corresponds to a use case: "a user retrieves a work order." The use case has steps: find the order, verify ownership, return the order. The service orchestrates these steps by calling repository methods and applying business rules. This is the **Transaction Script** pattern: a service method is a script that executes a business transaction. Every application feature maps to a service method.

**SE lens — side effects isolation.** `get_order` has no side effects (it reads data). `create_order` has one side effect (inserts a row). `delete_order` has one side effect (deletes a row). Side effects are inside the repository — the service tells the repository what to do, but the repository performs the I/O. This means: if you want to know whether `create_order` had side effects, look at the repository calls. If you want to mock side effects in tests, replace the repository. Side effects are isolated to one layer.

---

### 3. Update route handlers to use the service

Update `backend/main.py`:

```python
from work_order_service import WorkOrderService
from work_order_repository import SQLAlchemyWorkOrderRepository
from exceptions import OrderNotFoundError, PermissionDeniedError

def get_order_service(db: Session = Depends(get_db)) -> WorkOrderService:
    repo = SQLAlchemyWorkOrderRepository(db)
    return WorkOrderService(repo)

@app.get("/orders", response_model=list[WorkOrder])
def list_orders(
    service: WorkOrderService = Depends(get_order_service),
    current_user: UserModel = Depends(get_current_user)
):
    return service.list_orders_for_user(current_user.id)

@app.get("/orders/{order_id}", response_model=WorkOrder)
def get_order(
    order_id: int,
    service: WorkOrderService = Depends(get_order_service),
    current_user: UserModel = Depends(get_current_user)
):
    try:
        return service.get_order(order_id, current_user.id)
    except OrderNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))

@app.post("/orders", response_model=WorkOrder, status_code=201)
def create_order(
    order_data: WorkOrderCreate,
    service: WorkOrderService = Depends(get_order_service),
    current_user: UserModel = Depends(get_current_user)
):
    return service.create_order(order_data, current_user.id)

@app.put("/orders/{order_id}", response_model=WorkOrder)
def update_order(
    order_id: int,
    order_data: WorkOrderCreate,
    service: WorkOrderService = Depends(get_order_service),
    current_user: UserModel = Depends(get_current_user)
):
    try:
        return service.update_order(order_id, order_data, current_user.id)
    except OrderNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))

@app.delete("/orders/{order_id}", status_code=204)
def delete_order(
    order_id: int,
    service: WorkOrderService = Depends(get_order_service),
    current_user: UserModel = Depends(get_current_user)
):
    try:
        service.delete_order(order_id, current_user.id)
    except OrderNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))
```

**Walkthrough — route handler structure after the refactor:**

Each route handler now has a clear, consistent structure:
1. Call a service method
2. Catch domain exceptions and translate to HTTP exceptions
3. Return the result

No SQL. No business rules. No ownership logic. The ownership rule exists in exactly one place: `WorkOrderService.get_order` (and `update_order`, `delete_order`). If the rule changes — "admins can access all orders" — you change `WorkOrderService` and one test. Not three route handlers.

**Run `pytest tests/ -v`** — all existing tests must still pass.

**CS lens — exception handling as a contract.** The route handler is the exception translation boundary. Its contract: "convert domain exceptions to HTTP responses." This contract is explicit in the `try/except` blocks. A reader of the route handler sees immediately: this route can raise 404 or 403, here is when, and here is what HTTP status each produces. The mapping is visible without reading the service code.

**SE lens — three-line route handlers.** Notice `create_order`: it is three lines in the body (call service, no exceptions, return). Some of the get/update/delete handlers are five lines (call service, handle two exceptions, return). This brevity is intentional. Route handlers in production FastAPI applications should be as thin as possible — they are glue between the HTTP framework and the domain. Thick route handlers mean business logic has leaked into the HTTP layer.

---

### 4. Unit-test the service in isolation

Write a unit test for the service using `InMemoryWorkOrderRepository` (no database, no FastAPI):

Create `backend/tests/test_work_order_service.py`:

```python
import pytest
from work_order_service import WorkOrderService
from exceptions import OrderNotFoundError, PermissionDeniedError
from models import WorkOrderCreate

class InMemoryWorkOrderRepository:
    def __init__(self):
        self._orders = {}
        self._next_id = 1

    def get_all_for_user(self, user_id):
        return [o for o in self._orders.values() if o["owner_id"] == user_id]

    def get_by_id(self, order_id):
        return self._orders.get(order_id)

    def create(self, order_data, owner_id):
        order = {"id": self._next_id, **order_data.model_dump(), "owner_id": owner_id}
        self._orders[self._next_id] = order
        self._next_id += 1
        return order

    def update(self, order_id, order_data):
        if order_id not in self._orders:
            return None
        self._orders[order_id].update(order_data.model_dump())
        return self._orders[order_id]

    def delete(self, order_id):
        if order_id not in self._orders:
            return False
        del self._orders[order_id]
        return True

@pytest.fixture
def service():
    return WorkOrderService(InMemoryWorkOrderRepository())

def test_get_order_raises_not_found(service: WorkOrderService):
    with pytest.raises(OrderNotFoundError):
        service.get_order(order_id=999, user_id=1)

def test_get_order_raises_permission_denied_for_wrong_user(service: WorkOrderService):
    # Arrange: create an order for user 1
    order_data = WorkOrderCreate(title="Test", status="open", priority="high")
    created = service.create_order(order_data, user_id=1)

    # Act & Assert: user 2 cannot access it
    with pytest.raises(PermissionDeniedError):
        service.get_order(order_id=created["id"], user_id=2)

def test_create_and_list_orders_for_user(service: WorkOrderService):
    # Arrange
    order_data = WorkOrderCreate(title="My order", status="open", priority="medium")

    # Act
    service.create_order(order_data, user_id=1)
    service.create_order(WorkOrderCreate(title="Other user", status="open", priority="low"), user_id=2)

    # Assert: user 1 sees only their order
    orders = service.list_orders_for_user(user_id=1)
    assert len(orders) == 1
    assert orders[0]["title"] == "My order"
```

Run: `pytest backend/tests/test_work_order_service.py -v`

These tests run without a database, without FastAPI, without Docker. They run in milliseconds. They test pure business logic — the ownership rules — in complete isolation.

**Walkthrough — `pytest.raises`:**

`with pytest.raises(OrderNotFoundError):` — a context manager that asserts the block raises the specified exception. If the exception is not raised, the test fails. If a different exception is raised, it propagates (and the test fails with that exception). This is the correct way to test that a function raises an exception.

**CS lens — unit tests vs. integration tests.** The Sprint 5 tests are integration tests: they test the full HTTP stack, database, and application together. The service tests are unit tests: they test one module (the service) with a fake dependency (in-memory repo). Both are necessary. Integration tests verify the system works end-to-end. Unit tests verify that business logic is correct in isolation. Fast unit tests run on every file save; slow integration tests run in CI. The service layer makes unit testing possible — previously, there was no unit to test.

---

## Connect the pieces

The service layer is now in place:
- Business logic lives in `WorkOrderService`
- Domain exceptions replace `HTTPException` inside business logic
- Route handlers are thin glue: call service, translate exceptions, return response
- Unit tests verify business rules without database or HTTP

Lesson 4 applies SOLID principles — finding and fixing one violation of each principle in the current codebase.

---

## Definition of done

- [ ] `backend/exceptions.py` contains `OrderNotFoundError` and `PermissionDeniedError`
- [ ] `backend/work_order_service.py` contains `WorkOrderService`
- [ ] Route handlers call `service.method(...)` — no SQLAlchemy queries, no ownership checks
- [ ] `HTTPException` appears only in route handlers, not in the service
- [ ] `pytest tests/ -v` — all existing integration tests still pass
- [ ] `pytest backend/tests/test_work_order_service.py -v` — service unit tests pass
- [ ] You can explain why domain exceptions are better than returning `None` for error cases
- [ ] You can explain what the three-layer architecture buys you in testability

**Git commit:**

```
git add backend/exceptions.py backend/work_order_service.py backend/main.py backend/tests/test_work_order_service.py
git commit -m "Extract service layer: WorkOrderService with domain exceptions; route handlers are now thin translation layer"
```
