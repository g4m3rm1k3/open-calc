# Sprint 6 · Lesson 2 — IDOR: ownership checks and the 403

## What you will build

By the end of this lesson, every work order is owned by the user who created it. A user attempting to read, update, or delete another user's work order receives 403 Forbidden — not 404. You understand the IDOR vulnerability, the principle of least privilege, and why 403 is semantically correct where 404 is not. The test suite includes ownership verification tests.

---

## What you need to know first

- Sprint 4 L3: `get_current_user`, `current_user: UserModel` in route handlers.
- Sprint 3 L2: SQL foreign keys, JOIN queries.
- Sprint 3 L3: SQLAlchemy relationships, `filter()`.

---

## The lesson

---

### 1. What IDOR is

**The problem:** Your work order routes currently return any order by ID. A user can request `GET /orders/1` and receive order 1 — even if order 1 belongs to a different user. The ID is the only access control mechanism, and IDs are predictable (sequential integers). An authenticated user can enumerate every order in the system by iterating IDs.

**IDOR (Insecure Direct Object Reference):** A vulnerability where an application uses a user-controllable input (typically a database ID) to directly access an object, without verifying the requesting user is authorised to access that object. The fix is an ownership check: before returning the object, verify that the requesting user is the owner.

**Why this matters:** In a work order system, work orders may contain sensitive information: contractor names, costs, compliance records. An attacker who registers one account can read every other company's work orders by iterating `GET /orders/1`, `GET /orders/2`, etc. IDOR is on the OWASP Top 10 and is consistently the most common vulnerability found in API penetration tests.

**Current state:** JWT authentication confirms who the user is. It does not confirm what resources they can access. Authentication (who are you?) and authorisation (what are you allowed to do?) are separate concerns.

---

### 2. Add `owner_id` to work orders

**The database change:** Add a `owner_id` foreign key to `work_orders`. Create the migration:

```
alembic revision --autogenerate -m "Add owner_id to work orders"
alembic upgrade head
```

Update `backend/orm_models.py`:

```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class WorkOrderModel(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    status = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("UserModel", back_populates="work_orders")

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    work_orders = relationship("WorkOrderModel", back_populates="owner")
```

Update `backend/models.py` to add `owner_id` to the response model:

```python
class WorkOrder(BaseModel):
    id: int
    title: str
    status: str
    priority: str
    owner_id: int

    model_config = ConfigDict(from_attributes=True)
```

**Walkthrough:**

`owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)` — a foreign key column. `ForeignKey("users.id")` references the `id` column of the `users` table. `nullable=False` means every work order must have an owner — you cannot create an ownerless order.

`relationship("UserModel", back_populates="work_orders")` — SQLAlchemy ORM relationship. Allows `work_order.owner` to return the `UserModel` instance (a JOIN behind the scenes). `back_populates="work_orders"` links the relationship to `UserModel.work_orders` — the reverse side.

`work_orders = relationship("WorkOrderModel", back_populates="owner")` — the reverse side. `user.work_orders` returns a list of all orders owned by this user.

**CS lens — referential integrity as a database invariant.** The foreign key constraint is enforced by the database engine, not application code. If application code tries to insert a work order with `owner_id = 99999` (no user with ID 99999 exists), the database raises a foreign key violation and rolls back the transaction. Application code cannot create orphaned work orders — the constraint is a global invariant. This is the value of constraints at the data layer: they cannot be bypassed by bugs in application code.

---

### 3. Set `owner_id` on creation and scope queries to the owner

Update `backend/main.py` — the create route sets `owner_id` from the authenticated user:

```python
@app.post("/orders", response_model=WorkOrder, status_code=201)
def create_order(
    order_data: WorkOrderCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    new_order = WorkOrderModel(
        **order_data.model_dump(),
        owner_id=current_user.id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order
```

Update the list route to only return the current user's orders:

```python
@app.get("/orders", response_model=list[WorkOrder])
def list_orders(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return db.query(WorkOrderModel).filter(
        WorkOrderModel.owner_id == current_user.id
    ).all()
```

Write an ownership check helper to reuse across get/update/delete:

```python
def get_owned_order(order_id: int, db: Session, current_user: UserModel) -> WorkOrderModel:
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    if order.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to access this order")
    return order
```

Update the get, update, and delete routes to use it:

```python
@app.get("/orders/{order_id}", response_model=WorkOrder)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return get_owned_order(order_id, db, current_user)

@app.put("/orders/{order_id}", response_model=WorkOrder)
def update_order(
    order_id: int,
    order_data: WorkOrderCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    order = get_owned_order(order_id, db, current_user)
    for field, value in order_data.model_dump().items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order

@app.delete("/orders/{order_id}", status_code=204)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    order = get_owned_order(order_id, db, current_user)
    db.delete(order)
    db.commit()
```

**Walkthrough — `get_owned_order`:**

Step 1: `db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()` — look up the order by ID regardless of owner. Return 404 if it does not exist. This is correct — you do not leak whether an order exists by returning 404 here (if you returned 403 for non-existent orders, you would reveal ownership through the 403).

Wait — actually read this carefully: returning 404 for a non-existent order is correct. Returning **403** for an order that exists but is owned by someone else reveals that the order exists. Returning 404 for an order owned by someone else (hiding its existence) is an alternative approach. Your choice depends on the threat model.

**When 403 vs 404 for another user's resource:**

- **Return 403:** The order exists; the current user is not the owner. Reveals: this resource exists, you cannot access it.
- **Return 404 (security through obscurity):** Return 404 for any order you don't own, regardless of existence. Reveals: nothing about whether the resource exists.

The `get_owned_order` implementation above uses 403 (clear semantic). For a higher-security context, change to:

```python
order = db.query(WorkOrderModel).filter(
    WorkOrderModel.id == order_id,
    WorkOrderModel.owner_id == current_user.id
).first()
if order is None:
    raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
return order
```

This returns 404 whether the order doesn't exist or belongs to someone else. The caller cannot distinguish the two cases.

**CS lens — 401 vs 403 vs 404.** Three status codes for access failures, each with a distinct meaning:
- `401 Unauthorized` — the client is not authenticated (no valid token). Meaning: "identify yourself."
- `403 Forbidden` — the client is authenticated but not authorised for this resource. Meaning: "I know who you are; you cannot do this."
- `404 Not Found` — the resource does not exist (or, for security, you are treating it as nonexistent). Meaning: "nothing to see here."

Using the right status code matters: it enables clients to take the right action. A 401 prompts re-authentication; a 403 prompts the user to request access; a 404 tells the user the resource does not exist. Conflating them breaks the contract.

**SE lens — principle of least privilege.** Each authenticated user should have access to only the resources they need — no more. This is the **principle of least privilege**. Before this lesson, authenticated users could access all orders. After this lesson, authenticated users can access only their own orders. The permission change is minimal and scoped to the resource owner. When designing access control, always ask: "what is the minimum set of permissions this entity needs to do its job?"

---

### 4. Test ownership enforcement

Add to `backend/tests/test_orders.py`:

```python
def test_user_cannot_read_another_users_order(client: TestClient, db_session):
    from auth import hash_password
    from orm_models import UserModel, WorkOrderModel

    # Arrange: create two users
    user_a = UserModel(username="usera", hashed_password=hash_password("pass"))
    user_b = UserModel(username="userb", hashed_password=hash_password("pass"))
    db_session.add_all([user_a, user_b])
    db_session.flush()

    # User A creates an order
    order = WorkOrderModel(
        title="User A's order",
        status="open",
        priority="high",
        owner_id=user_a.id
    )
    db_session.add(order)
    db_session.flush()

    # Act: user B tries to access user A's order
    login_b = client.post("/auth/login", json={"username": "userb", "password": "pass"})
    token_b = login_b.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token_b}"}

    response = client.get(f"/orders/{order.id}")

    # Assert: 403 Forbidden (or 404 if using the obscurity approach)
    assert response.status_code in (403, 404)

def test_list_orders_returns_only_owned_orders(client: TestClient, db_session):
    from auth import hash_password
    from orm_models import UserModel, WorkOrderModel

    # Arrange: user A and user B each have an order
    user_a = UserModel(username="list_usera", hashed_password=hash_password("pass"))
    user_b = UserModel(username="list_userb", hashed_password=hash_password("pass"))
    db_session.add_all([user_a, user_b])
    db_session.flush()

    order_a = WorkOrderModel(title="A's order", status="open", priority="high", owner_id=user_a.id)
    order_b = WorkOrderModel(title="B's order", status="open", priority="low", owner_id=user_b.id)
    db_session.add_all([order_a, order_b])
    db_session.flush()

    # Act: user A logs in and lists their orders
    login_a = client.post("/auth/login", json={"username": "list_usera", "password": "pass"})
    token_a = login_a.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token_a}"}

    response = client.get("/orders")

    # Assert: only user A's order is returned
    assert response.status_code == 200
    orders = response.json()
    titles = [o["title"] for o in orders]
    assert "A's order" in titles
    assert "B's order" not in titles

def test_user_cannot_delete_another_users_order(client: TestClient, db_session):
    from auth import hash_password
    from orm_models import UserModel, WorkOrderModel

    # Arrange
    user_a = UserModel(username="del_usera", hashed_password=hash_password("pass"))
    user_b = UserModel(username="del_userb", hashed_password=hash_password("pass"))
    db_session.add_all([user_a, user_b])
    db_session.flush()

    order = WorkOrderModel(title="A's order", status="open", priority="high", owner_id=user_a.id)
    db_session.add(order)
    db_session.flush()

    # User B tries to delete user A's order
    login_b = client.post("/auth/login", json={"username": "del_userb", "password": "pass"})
    token_b = login_b.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token_b}"}

    response = client.delete(f"/orders/{order.id}")

    # Assert: forbidden
    assert response.status_code in (403, 404)

    # Verify the order still exists (was not deleted)
    client.headers = {"Authorization": f"Bearer {login_b.json()['access_token']}"}
    login_a = client.post("/auth/login", json={"username": "del_usera", "password": "pass"})
    client.headers = {"Authorization": f"Bearer {login_a.json()['access_token']}"}
    get_response = client.get(f"/orders/{order.id}")
    assert get_response.status_code == 200
```

**Walkthrough — direct DB setup in tests:**

These tests create users and orders directly via the `db_session` fixture (not via HTTP requests). This is acceptable for ownership tests because the goal is to test access control — the creation of users and orders is test infrastructure, not the thing being tested. Direct DB setup is faster and more explicit than going through the HTTP layer for arrangement.

`db_session.flush()` — sends the pending SQL to the database within the current transaction (makes the inserted rows visible for subsequent queries in the same session) without committing. This is needed so `user_a.id` is populated (set by the database's SERIAL) before creating the work order that references it.

**CS lens — access control tests as security regression tests.** These tests verify that IDOR does not exist. When someone refactors the query logic in Sprint 7, these tests will fail if they accidentally remove the ownership filter. The test `test_list_orders_returns_only_owned_orders` is a particularly strong regression test: it creates data for two users and asserts that each user sees only their own data. This test would have caught every real-world IDOR incident if it had existed.

**SE lens — the invisible security debt.** Before this lesson, the application had an IDOR vulnerability that no linter, type checker, or test would have caught. It was invisible. The lesson: security vulnerabilities are not syntax errors — they are logical gaps in access control that only deliberate security testing reveals. Adding ownership checks and the corresponding tests converts the invisible debt into verified protection.

---

## Connect the pieces

The work order application now has:
- Authentication (who are you): JWT in Sprint 4
- Authorisation (what can you do): ownership checks in this lesson
- Both verified by automated tests

Lesson 3 covers XSS, CORS, and HTTP security headers — protecting the frontend from cross-origin attacks and content injection.

---

## What breaks without this

**`nullable=False` on `owner_id` before migrating existing data:** If you run the migration on a database with existing rows that have no `owner_id`, the NOT NULL constraint fails. Fix: either set a default value in the migration (`server_default='1'`), or clear the table first. In production, this requires a data migration step before the schema migration.

---

## Definition of done

- [ ] `WorkOrderModel` has `owner_id` (FK to `users.id`, not null) and `owner` relationship
- [ ] Create order sets `owner_id = current_user.id`
- [ ] List orders filters by `owner_id == current_user.id`
- [ ] Get/update/delete order checks ownership and returns 403 (or 404) for other users' orders
- [ ] `test_user_cannot_read_another_users_order` passes
- [ ] `test_list_orders_returns_only_owned_orders` passes
- [ ] You can explain the difference between 401, 403, and 404 in access control contexts
- [ ] You can explain the principle of least privilege

**Git commit:**

```
git add backend/orm_models.py backend/models.py backend/main.py backend/tests/
git commit -m "Add ownership checks: owner_id on work orders, 403 on cross-user access, IDOR prevention tests"
```
