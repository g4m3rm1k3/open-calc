# Sprint 7 · Lesson 2 — The Repository Pattern

## What you will build

By the end of this lesson, all SQLAlchemy queries are extracted into a `WorkOrderRepository` class. Route handlers call repository methods (`repo.get_by_id(order_id)`) instead of writing queries directly. The repository is defined by a `Protocol` (Python's structural interface), so tests can swap it for an in-memory implementation without touching a database. All existing tests still pass after the refactor.

---

## What you need to know first

- Sprint 7 L1: The three structural problems; what the data layer is responsible for.
- Sprint 3 L3: SQLAlchemy ORM, `db.query().filter().first()`, sessions.

---

## The lesson

---

### 1. Define the Repository Protocol

**The problem:** If route handlers and service functions call `db.query(WorkOrderModel).filter(...)` directly, they are tightly coupled to SQLAlchemy. The repository pattern introduces an abstraction: the rest of the application depends on an interface ("give me an order by ID"), not an implementation ("use SQLAlchemy to execute this query"). The interface is defined with a Python `Protocol`.

Create `backend/repositories.py`:

```python
from typing import Protocol, Optional
from models import WorkOrderCreate

class WorkOrderRepository(Protocol):
    def get_all_for_user(self, user_id: int) -> list:
        ...

    def get_by_id(self, order_id: int) -> Optional[object]:
        ...

    def create(self, order_data: WorkOrderCreate, owner_id: int) -> object:
        ...

    def update(self, order_id: int, order_data: WorkOrderCreate) -> Optional[object]:
        ...

    def delete(self, order_id: int) -> bool:
        ...
```

**Walkthrough:**

`Protocol` — from Python's `typing` module. A `Protocol` defines an interface by declaring method signatures. Any class that implements these methods satisfies the protocol — no explicit inheritance required. This is **structural subtyping** (duck typing, formalised).

`...` in method bodies — `...` (Ellipsis literal) is the Python idiom for "this is a Protocol method — no implementation here." It is equivalent to `pass` but signals intent.

`Optional[object]` — some methods return `None` if not found. `Optional[object]` is `Union[object, None]`.

**Why `Protocol` instead of `ABC` (Abstract Base Class)?** With ABC, you write `class SQLAlchemyWorkOrderRepository(WorkOrderRepositoryABC)` — explicit inheritance. With Protocol, you write `class SQLAlchemyWorkOrderRepository` — nothing. The class satisfies the Protocol if it has all the methods. This means: existing classes can satisfy Protocols without modification. Third-party code can satisfy your Protocol. Tests can use `dict`-based fakes without inheriting anything.

**CS lens — structural vs. nominal typing.** Most OOP languages use **nominal typing**: a class is a subtype of another class only if it explicitly inherits from it. Python's `Protocol` introduces **structural typing**: a class is compatible with a Protocol if it has the required attributes, regardless of inheritance. TypeScript, Go, and OCaml use structural typing natively. Python added it in 3.8 (`typing.Protocol`). Structural typing enables duck typing with type-checker support.

**SE lens — interfaces as dependency inversion.** The Dependency Inversion Principle (the D in SOLID, covered in L4): "high-level modules should not depend on low-level modules; both should depend on abstractions." Without the Protocol, route handlers depend on `SQLAlchemy` (low-level). With the Protocol, route handlers depend on `WorkOrderRepository` (abstraction). The SQLAlchemy implementation depends on the Protocol too. Both depend on the abstraction in the middle — neither depends on the other.

---

### 2. Implement `SQLAlchemyWorkOrderRepository`

Create `backend/work_order_repository.py`:

```python
from sqlalchemy.orm import Session
from typing import Optional
from orm_models import WorkOrderModel
from models import WorkOrderCreate

class SQLAlchemyWorkOrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_for_user(self, user_id: int) -> list[WorkOrderModel]:
        return (
            self.db.query(WorkOrderModel)
            .filter(WorkOrderModel.owner_id == user_id)
            .all()
        )

    def get_by_id(self, order_id: int) -> Optional[WorkOrderModel]:
        return (
            self.db.query(WorkOrderModel)
            .filter(WorkOrderModel.id == order_id)
            .first()
        )

    def create(self, order_data: WorkOrderCreate, owner_id: int) -> WorkOrderModel:
        new_order = WorkOrderModel(
            **order_data.model_dump(),
            owner_id=owner_id
        )
        self.db.add(new_order)
        self.db.commit()
        self.db.refresh(new_order)
        return new_order

    def update(self, order_id: int, order_data: WorkOrderCreate) -> Optional[WorkOrderModel]:
        order = self.get_by_id(order_id)
        if order is None:
            return None
        for field, value in order_data.model_dump().items():
            setattr(order, field, value)
        self.db.commit()
        self.db.refresh(order)
        return order

    def delete(self, order_id: int) -> bool:
        order = self.get_by_id(order_id)
        if order is None:
            return False
        self.db.delete(order)
        self.db.commit()
        return True
```

**Walkthrough:**

`__init__(self, db: Session)` — the repository takes a database session at construction time. The session is a dependency — the repository does not create it. This is constructor injection: the caller provides the dependency.

`get_all_for_user(self, user_id: int)` — the query that was in the route handler is now here. The route handler no longer imports `WorkOrderModel` or writes `.filter(...)`.

`update` — returns `None` if the order was not found (instead of raising `HTTPException`). The repository does not know about HTTP. `None` is a domain-level signal: "nothing found." The service layer (Lesson 3) translates `None` into an `HTTPException`.

`delete` — returns `bool` (True if deleted, False if not found). Same principle: domain signal, not HTTP signal.

**Notice what is NOT here:**
- No `HTTPException` imports
- No `current_user` parameter (the repository does not know about authentication)
- No FastAPI imports

The repository does one thing: perform database operations on work orders.

**CS lens — the repository as an abstraction over the query language.** SQL is a language. SQLAlchemy ORM is a different language. The repository provides a third language: the domain language ("get all orders for this user"). The caller does not need to know SQL or SQLAlchemy — only the domain operations. When you add a Redis cache, you add a `CachedWorkOrderRepository` that wraps `SQLAlchemyWorkOrderRepository` and caches `get_by_id` results. The route handlers and service functions change nothing — they still call `repo.get_by_id(order_id)`.

**SE lens — the test swap.** The Protocol exists to make testing easy. Here is an in-memory repository for unit tests:

```python
class InMemoryWorkOrderRepository:
    def __init__(self):
        self._orders: dict[int, dict] = {}
        self._next_id = 1

    def get_all_for_user(self, user_id: int) -> list:
        return [o for o in self._orders.values() if o["owner_id"] == user_id]

    def get_by_id(self, order_id: int):
        return self._orders.get(order_id)

    def create(self, order_data, owner_id: int):
        order = {"id": self._next_id, **order_data.model_dump(), "owner_id": owner_id}
        self._orders[self._next_id] = order
        self._next_id += 1
        return order

    def update(self, order_id: int, order_data):
        if order_id not in self._orders:
            return None
        self._orders[order_id].update(order_data.model_dump())
        return self._orders[order_id]

    def delete(self, order_id: int) -> bool:
        if order_id not in self._orders:
            return False
        del self._orders[order_id]
        return True
```

`InMemoryWorkOrderRepository` has no database, no SQLAlchemy, no network. It satisfies the `WorkOrderRepository` Protocol. It can be used in unit tests for the service layer (Lesson 3) with no test database setup required — the tests run in milliseconds.

---

### 3. Update route handlers to use the repository

Update `backend/main.py` to inject the repository:

```python
from work_order_repository import SQLAlchemyWorkOrderRepository

def get_order_repo(db: Session = Depends(get_db)) -> SQLAlchemyWorkOrderRepository:
    return SQLAlchemyWorkOrderRepository(db)

@app.get("/orders", response_model=list[WorkOrder])
def list_orders(
    repo: SQLAlchemyWorkOrderRepository = Depends(get_order_repo),
    current_user: UserModel = Depends(get_current_user)
):
    return repo.get_all_for_user(current_user.id)

@app.get("/orders/{order_id}", response_model=WorkOrder)
def get_order(
    order_id: int,
    repo: SQLAlchemyWorkOrderRepository = Depends(get_order_repo),
    current_user: UserModel = Depends(get_current_user)
):
    order = repo.get_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    if order.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to access this order")
    return order

@app.post("/orders", response_model=WorkOrder, status_code=201)
def create_order(
    order_data: WorkOrderCreate,
    repo: SQLAlchemyWorkOrderRepository = Depends(get_order_repo),
    current_user: UserModel = Depends(get_current_user)
):
    return repo.create(order_data, owner_id=current_user.id)

@app.put("/orders/{order_id}", response_model=WorkOrder)
def update_order(
    order_id: int,
    order_data: WorkOrderCreate,
    repo: SQLAlchemyWorkOrderRepository = Depends(get_order_repo),
    current_user: UserModel = Depends(get_current_user)
):
    order = repo.get_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    if order.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to access this order")
    updated = repo.update(order_id, order_data)
    return updated

@app.delete("/orders/{order_id}", status_code=204)
def delete_order(
    order_id: int,
    repo: SQLAlchemyWorkOrderRepository = Depends(get_order_repo),
    current_user: UserModel = Depends(get_current_user)
):
    order = repo.get_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    if order.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to access this order")
    repo.delete(order_id)
```

Route handlers are now shorter. No `.query()`, no `.filter()`, no `.add()`, no `.commit()`. The route handler still contains the ownership check — that moves to the service layer in Lesson 3.

**Run the test suite:** `pytest tests/ -v` — all tests should still pass. This is the refactoring guarantee: the tests document the behaviour; the tests passing after refactoring prove behaviour has not changed.

**Walkthrough — `get_order_repo`:**

`get_order_repo` is a FastAPI dependency that creates a repository from a database session. Routes that `Depends(get_order_repo)` receive a `SQLAlchemyWorkOrderRepository` instance. The dependency is injectable — tests can override it with `InMemoryWorkOrderRepository`.

Override in `conftest.py`:
```python
from work_order_repository import InMemoryWorkOrderRepository

@pytest.fixture
def client_with_in_memory_repo(db_session):
    def override_get_order_repo():
        return InMemoryWorkOrderRepository()
    app.dependency_overrides[get_order_repo] = override_get_order_repo
    yield TestClient(app)
    app.dependency_overrides.clear()
```

Now tests that use `client_with_in_memory_repo` run without a database — millisecond-speed.

**CS lens — the Dependency Inversion in practice.** The route handler before: `db.query(WorkOrderModel).filter(...)` — the route handler constructs the query, tied to SQLAlchemy. After: `repo.get_by_id(order_id)` — the route handler calls an abstract method. The concrete class (`SQLAlchemyWorkOrderRepository`) is injected by FastAPI. The route handler does not import SQLAlchemy at all. The dependency graph is inverted: high-level code (route handlers) depends on abstractions (Protocol), not on implementations (SQLAlchemy).

---

## Connect the pieces

The repository pattern is now in place:
- All SQL lives in `SQLAlchemyWorkOrderRepository`
- Route handlers call domain methods, not SQL
- The `WorkOrderRepository` Protocol enables test doubles
- All existing tests still pass

Lesson 3 extracts the business logic (ownership checks, creation rules) into a service layer, removing the remaining `HTTPException` calls from business logic functions.

---

## What breaks without this

**`get_by_id` returning None vs. raising inside the repository:** The repository returns `None` for not-found. If it raised `HTTPException(404)` directly, the repository would be coupled to HTTP. Tests using `InMemoryWorkOrderRepository` would receive HTTP exceptions from the wrong layer. Keep domain signals (None, False) in the repository; keep HTTP signals (HTTPException) in the route handlers or service layer.

---

## Definition of done

- [ ] `backend/work_order_repository.py` exists with `SQLAlchemyWorkOrderRepository`
- [ ] `backend/repositories.py` exists with `WorkOrderRepository` Protocol
- [ ] Route handlers call `repo.get_by_id()`, `repo.create()`, etc. — no SQLAlchemy query syntax in `main.py`
- [ ] `pytest tests/ -v` — all tests pass (no regressions)
- [ ] You can explain the difference between Protocol (structural typing) and ABC (nominal typing)
- [ ] You can explain why the repository does not raise `HTTPException`
- [ ] You can describe what `InMemoryWorkOrderRepository` would look like and why it satisfies the Protocol

**Git commit:**

```
git add backend/repositories.py backend/work_order_repository.py backend/main.py
git commit -m "Extract repository layer: SQLAlchemyWorkOrderRepository and Protocol; route handlers call repo methods, no direct SQLAlchemy in routes"
```
