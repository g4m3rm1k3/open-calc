# Sprint 7 · Lesson 4 — SOLID in practice

## What you will build

By the end of this lesson, you will find one concrete violation of each SOLID principle in the codebase and apply a targeted fix. You will be able to read any codebase and identify these five patterns by name. The refactors are small — each fix is 5–20 lines. The goal is pattern recognition, not comprehensive refactoring.

---

## What you need to know first

- Sprint 7 L1–L3: Three-layer architecture (HTTP, service, repository).

---

## The lesson

---

### 1. Single Responsibility Principle: one reason to change

**Definition:** A class (or module) should have only one reason to change. "Reason to change" means: what category of requirement change forces you to modify this class?

**The violation:** Look at `auth.py`. It currently contains:

1. JWT token creation and decoding
2. Password hashing and verification
3. The `get_current_user` FastAPI dependency

Three separate responsibilities:
- Token logic changes when you change the JWT algorithm or expiry
- Password logic changes when you change the hashing algorithm
- The FastAPI dependency changes when you change how authentication is wired

**The fix:** Split `auth.py` into three modules:

Rename `auth.py` → `jwt_utils.py`:

```python
# backend/jwt_utils.py
import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid or expired token")
```

Create `backend/password_utils.py`:

```python
# backend/password_utils.py
from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return _pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)
```

Create `backend/auth_dependencies.py`:

```python
# backend/auth_dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from jwt_utils import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (ValueError, KeyError):
        raise credentials_exception

    from orm_models import UserModel
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
```

Update all imports across `main.py`, `conftest.py`, and tests.

**After the split:**
- `jwt_utils.py` changes when you change the JWT strategy
- `password_utils.py` changes when you change the hashing algorithm
- `auth_dependencies.py` changes when you change how FastAPI wires authentication

Each module has exactly one reason to change.

**CS lens — cohesion as the measure of SRP.** A module's cohesion measures how closely related its functions are. Putting `hash_password`, `create_access_token`, and `get_current_user` in one file is low cohesion — these three functions are related only by the vague concept of "auth." After the split, each module is maximally cohesive: `password_utils.py` contains only password-related functions; `jwt_utils.py` contains only JWT-related functions.

---

### 2. Open/Closed Principle: open for extension, closed for modification

**Definition:** Software entities should be open for extension but closed for modification. When new behaviour is needed, add new code — don't change existing code.

**The violation:** Imagine you need to add email notifications when a work order is created. Without OCP, you would modify `create_order` in `WorkOrderService`:

```python
def create_order(self, order_data: WorkOrderCreate, user_id: int):
    order = self.repo.create(order_data, owner_id=user_id)
    self.email_service.send_creation_email(order)  # added
    return order
```

Then add Slack notification. Then add audit logging. Each addition modifies `create_order`. The function grows. Tests for the creation logic must now also deal with email, Slack, and logging dependencies.

**The fix — events/hooks pattern:**

```python
from typing import Callable

class WorkOrderService:
    def __init__(self, repo: WorkOrderRepository):
        self.repo = repo
        self._on_create_hooks: list[Callable] = []

    def register_on_create(self, hook: Callable) -> None:
        self._on_create_hooks.append(hook)

    def create_order(self, order_data: WorkOrderCreate, user_id: int):
        order = self.repo.create(order_data, owner_id=user_id)
        for hook in self._on_create_hooks:
            hook(order)
        return order
```

Adding email notification:

```python
service = WorkOrderService(repo)
service.register_on_create(lambda order: email_service.send_creation_email(order))
```

`create_order` is never modified — it is extended by adding hooks. The existing behaviour is closed for modification. New behaviour (email, Slack, audit) is open for extension via hooks.

**CS lens — OCP and the open world.** OCP is a response to the reality that requirements change after deployment. Code that is closed for modification means: the core logic never needs to change when new use cases are added. Event systems, plugin architectures, and hook systems are all implementations of OCP. React's `useEffect` is an extension hook: the component lifecycle is closed for modification, but open for extension via effects.

**SE lens — OCP in frameworks.** Django's middleware system is OCP: you do not modify Django's request handling to add logging — you add a middleware class. FastAPI's `Depends` system is OCP: you do not modify route handlers to add rate limiting — you add a dependency. Observing these systems reveals OCP in action.

---

### 3. Liskov Substitution Principle: subtypes must honour the contract

**Definition:** If `S` is a subtype of `T`, then objects of type `T` can be replaced with objects of type `S` without breaking the program.

**The violation — would happen with careless Protocol implementation:**

The `WorkOrderRepository` Protocol defines `delete(self, order_id: int) -> bool`. Both `SQLAlchemyWorkOrderRepository` and `InMemoryWorkOrderRepository` return `True` if deleted, `False` if not found.

An LSP violation would be: `CachedWorkOrderRepository.delete()` returns the deleted order as a `WorkOrderModel` instead of `bool`. Code that does `if repo.delete(order_id):` now breaks — comparing a `WorkOrderModel` to a boolean.

**The fix — enforce the return type contract:**

Add return type annotations to the Protocol:

```python
class WorkOrderRepository(Protocol):
    def delete(self, order_id: int) -> bool: ...
```

Mypy or pyright will catch any implementation that returns a different type. The Protocol's method signatures are the contract — implementations must honour them exactly.

**CS lens — LSP and the substitution test.** The Liskov test: can you replace any instance of the base type with an instance of the subtype without any calling code noticing? If `InMemoryWorkOrderRepository.delete()` raises `NotImplementedError` in some cases, the test that uses it breaks — not because of a logic error, but because the subtype violates the contract. LSP makes subtypes reliable drop-in replacements.

---

### 4. Interface Segregation Principle: clients should not depend on methods they do not use

**Definition:** No client should be forced to depend on methods it does not use.

**The violation:** `WorkOrderRepository` Protocol has 5 methods. Imagine adding an `AdminRepository` that can search all orders across users. The admin feature only needs `get_all_orders(query: str)` — but if you add this to `WorkOrderRepository`, every implementation (including `InMemoryWorkOrderRepository` in tests) must implement it, even if the test never calls it.

**The fix — split the Protocol:**

```python
class WorkOrderReadRepository(Protocol):
    def get_all_for_user(self, user_id: int) -> list: ...
    def get_by_id(self, order_id: int) -> Optional[object]: ...

class WorkOrderWriteRepository(Protocol):
    def create(self, order_data: WorkOrderCreate, owner_id: int) -> object: ...
    def update(self, order_id: int, order_data: WorkOrderCreate) -> Optional[object]: ...
    def delete(self, order_id: int) -> bool: ...

class WorkOrderRepository(WorkOrderReadRepository, WorkOrderWriteRepository, Protocol):
    pass
```

Read-only contexts (reporting, analytics) depend on `WorkOrderReadRepository` — they cannot call write methods. Write contexts depend on both. Test fakes only implement the methods the test needs.

**CS lens — ISP and minimal interfaces.** Small interfaces are easier to implement (fewer methods) and easier to satisfy with test fakes. An interface with 20 methods requires 20 implementations in every mock or fake. An interface with 3 methods requires 3. Splitting interfaces reduces the burden on implementations.

---

### 5. Dependency Inversion Principle: depend on abstractions

**Definition:** High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.

**Already applied — and the proof:**

This is exactly what Lessons 2 and 3 implemented. The evidence is in the import graph:

**Before:**
```
main.py → SQLAlchemy (low-level)
main.py → WorkOrderModel (low-level)
```

**After:**
```
main.py → WorkOrderService (abstraction)
WorkOrderService → WorkOrderRepository Protocol (abstraction)
SQLAlchemyWorkOrderRepository → SQLAlchemy (low-level)
```

`main.py` no longer imports SQLAlchemy. It imports `WorkOrderService`. `WorkOrderService` imports `WorkOrderRepository` (Protocol). The concrete database implementation (`SQLAlchemyWorkOrderRepository`) is provided at runtime via dependency injection.

**The test for DIP:** Can you run `main.py` tests without SQLAlchemy installed? With DIP applied, route handler unit tests (using `InMemoryWorkOrderRepository`) do not need SQLAlchemy. The dependency goes through the abstraction, and the test provides a fake implementation. `SQLAlchemy` is an optional dependency for some tests — required only for integration tests.

**CS lens — dependency inversion and IoC containers.** Dependency Inversion is closely related to Inversion of Control (IoC). FastAPI's `Depends(...)` system is an IoC container: it resolves dependencies at runtime and injects them. The route handler declares what it needs; FastAPI provides it. This is DIP implemented by the framework: route handlers depend on abstractions (`get_order_service`), not on concrete implementations (`SQLAlchemyWorkOrderRepository` directly).

---

## SOLID in one paragraph

**S** — each module has one reason to change. Split `auth.py` into three.

**O** — extend behaviour without modifying existing code. Use hooks instead of modifying `create_order`.

**L** — subtypes can replace base types. Enforce return type contracts in Protocols.

**I** — clients depend only on methods they use. Split large Protocols into smaller ones.

**D** — depend on abstractions. Route handlers call `WorkOrderService`; service calls `WorkOrderRepository` Protocol.

These five principles are not rules to follow mechanically — they are symptoms to diagnose. When you feel friction changing code, trace the friction to a SOLID violation. Apply the corresponding fix.

---

## Connect the pieces

Sprint 7 transformed the code structure:
- `main.py` is thin route handlers that delegate to a service
- `WorkOrderService` contains business rules
- `SQLAlchemyWorkOrderRepository` contains all database access
- `WorkOrderRepository` Protocol enables test doubles
- Domain exceptions separate domain language from HTTP language
- SOLID principles name the five structural properties that make the code changeable

Sprint 8 prepares the application for production: Docker multi-stage builds, Nginx reverse proxy, deployment to a VPS, structured logging, and Sentry error tracking.

---

## Definition of done

- [ ] `auth.py` is split into `jwt_utils.py`, `password_utils.py`, and `auth_dependencies.py`
- [ ] All imports updated; `pytest tests/ -v` still passes
- [ ] You can point to where OCP is applied in the hooks pattern
- [ ] You can explain LSP using the `WorkOrderRepository.delete()` return type contract
- [ ] You can explain why ISP splits the Protocol into read and write interfaces
- [ ] You can explain DIP using the import graph comparison (before/after)
- [ ] You can give a one-sentence definition of each SOLID principle

**Git commit:**

```
git add backend/jwt_utils.py backend/password_utils.py backend/auth_dependencies.py backend/repositories.py
git commit -m "Apply SOLID: split auth into jwt_utils/password_utils/auth_dependencies; annotate Protocol return types"
```
