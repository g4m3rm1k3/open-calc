# Sprint 4 · Lesson 3 — Protected API endpoints

## What you will build

By the end of this lesson, every work order endpoint requires a valid JWT. A request without a token receives 401. A request with an expired or tampered token receives 401. A valid token's user ID is available inside every protected route handler. The dependency injection system wires this in one place — not copied into ten route handlers.

---

## What you need to know first

- Sprint 4 L2: JWT structure, `decode_access_token`, the `Authorization: Bearer` header.
- Sprint 3 L3: `Depends(get_db)`, SQLAlchemy sessions, `UserModel`.

---

## The lesson

---

### 1. Write the `get_current_user` dependency

**The problem:** Every protected route needs to: extract the token from the HTTP header, decode it, look up the user in the database, and return the user object — or return 401 if anything fails. If you write this logic in every route handler, you violate DRY (Don't Repeat Yourself) and create ten places where a security bug could hide. One place: one bug surface.

Add to `backend/auth.py`:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db

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
        user_id_str: str = payload.get("sub")
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

**Walkthrough:**

`OAuth2PasswordBearer(tokenUrl="/auth/login")` — a FastAPI utility that extracts the Bearer token from the `Authorization` header of an incoming request. When a route `Depends(oauth2_scheme)`, FastAPI:
1. Reads the `Authorization` header
2. Verifies it starts with `Bearer `
3. Extracts the token string after `Bearer `
4. Passes it as the `token` argument

If the `Authorization` header is missing or malformed, `oauth2_scheme` automatically raises a 401. You do not write that check — it is built in.

`tokenUrl="/auth/login"` — tells the OpenAPI schema generator where clients go to get a token. The `/docs` page will show a lock icon on protected endpoints and an "Authorize" button that POSTs to `/auth/login`.

`credentials_exception` — a single `HTTPException` object defined at the start of the function. All failure paths raise the same exception with the same message. This is intentional: whether the token is missing, expired, malformed, or belongs to a deleted user, the response is identical — `"Could not validate credentials"`. The attacker learns nothing specific about why authentication failed.

`payload = decode_access_token(token)` — decodes and verifies the JWT. If the token is expired, tampered, or malformed, `decode_access_token` raises `ValueError`, which the `except` block catches.

`payload.get("sub")` — reads the `sub` claim. `.get` returns `None` if the key is absent, avoiding `KeyError`. If `sub` is `None`, the token does not identify a user — raise `credentials_exception`.

`int(user_id_str)` — converts the `sub` string to an integer. `sub` was stored as `str(user.id)` in `create_access_token`. The conversion may raise `ValueError` if `sub` is not a valid integer — caught by the `except` block.

`db.query(UserModel).filter(UserModel.id == user_id).first()` — looks up the user in the database. This is the live database check: if the user was deleted after the token was issued, `user is None` and authentication fails. The token alone does not prove the user still exists.

`return user` — returns the `UserModel` instance. Route handlers receive this as their `current_user` parameter.

**CS lens — composing dependencies.** `get_current_user` depends on both `oauth2_scheme` (token extraction) and `get_db` (database session). FastAPI resolves these dependencies in a dependency graph: `oauth2_scheme` runs first (extracts token), `get_db` runs (opens session), then `get_current_user` runs with both results. Route handlers that `Depends(get_current_user)` automatically get this entire chain. Dependency injection turns authentication from imperative code (do this, then that) into declarative composition (this route needs the current user, period).

**SE lens — one auth function, zero drift.** With `get_current_user` centralised in `auth.py`, every security-relevant decision (token format, error message, user lookup logic) is in one function. If a security bug is found — say, the `sub` validation was missing — fixing it in `get_current_user` fixes it for every protected endpoint simultaneously. If the same logic were copied into ten route handlers, finding and fixing every copy is error-prone. The centralised approach is a direct application of the **single source of truth** principle.

**What breaks without this:** If you write `Authorization: Bearer` header parsing in each route handler, a single typo (e.g., checking `"bearer"` instead of `"Bearer"`) breaks authentication on some routes but not others. The mismatch is invisible until a client using a case-sensitive comparison reports a mysterious 401.

---

### 2. Protect the work order endpoints

**The problem:** Add `current_user` as a dependency to every work order route. The routes do not need to use `current_user` — its presence is sufficient to enforce authentication.

Update each route in `backend/main.py` to add `current_user = Depends(get_current_user)`:

```python
from auth import hash_password, verify_password, create_access_token, get_current_user
from orm_models import WorkOrderModel, UserModel

@app.get("/orders", response_model=list[WorkOrder])
def list_orders(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return db.query(WorkOrderModel).all()

@app.get("/orders/{order_id}", response_model=WorkOrder)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return order

@app.post("/orders", response_model=WorkOrder, status_code=201)
def create_order(
    order_data: WorkOrderCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    new_order = WorkOrderModel(**order_data.model_dump())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@app.put("/orders/{order_id}", response_model=WorkOrder)
def update_order(
    order_id: int,
    order_data: WorkOrderCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
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
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    db.delete(order)
    db.commit()
```

**Walkthrough:** Each route now has `current_user: UserModel = Depends(get_current_user)`. FastAPI runs `get_current_user` before calling the route handler. If `get_current_user` raises `HTTPException(401)`, the route handler is never called — the 401 is returned immediately.

`current_user` is the authenticated user. The work order routes do not use it (yet — Sprint 6 adds ownership checks). Its presence enforces authentication as a side effect of the dependency resolution.

Test the protection:

```
GET http://localhost:8000/orders
```
Without a token: `401 Unauthorized, "Not authenticated"`

```
GET http://localhost:8000/orders
Authorization: Bearer eyJ...
```
With a valid token: `200 OK`, list of orders.

In the `/docs` UI: click the lock icon at the top right → enter your token in the `Value` field (format: just the token, not "Bearer token"). The docs UI adds "Bearer " automatically.

**CS lens — FastAPI's dependency graph as a DAG.** FastAPI builds a **directed acyclic graph (DAG)** of dependencies. `list_orders` depends on `get_db` and `get_current_user`. `get_current_user` depends on `oauth2_scheme` and `get_db`. FastAPI detects that `get_db` is shared — it calls `get_db` once and passes the same session to both `list_orders` and `get_current_user`. If it called `get_db` twice, they would have different sessions, which would cause problems with transaction isolation. FastAPI's dependency resolution ensures shared dependencies are called once per request.

**SE lens — `current_user` as unused but required.** Having `current_user` in the function signature but not using it in the body looks like dead code. It is not — it is a **side-effectful dependency**. The route handler needs the authentication check to run; it does not need the user object. This pattern appears throughout production FastAPI applications: "require authentication without needing the user's details." Linters like flake8 warn about unused variables — the `current_user: UserModel = Depends(...)` pattern should be commented or configured to suppress the warning.

**What breaks without this:** If you add `Depends(get_current_user)` to some routes but forget others, the unprotected routes are accessible without a token. There is no compile-time or startup-time check that all routes are protected — it is a runtime gap. Sprint 5 will write tests that verify every sensitive endpoint requires authentication.

---

### 3. Verify the full auth flow

**The problem:** Confirm that the entire chain — register, login, use token — works.

Step through this sequence in `/docs`:

1. `POST /auth/register` → `{"username": "testuser", "password": "testpass"}` → `201`
2. `POST /auth/login` → `{"username": "testuser", "password": "testpass"}` → `200`, copy the `access_token`
3. Click the lock icon in `/docs` → paste the token → click "Authorize"
4. `GET /orders` → `200` (authenticated)
5. In a new curl or API client, `GET /orders` without the token → `401`
6. Wait 30 minutes (or temporarily lower `ACCESS_TOKEN_EXPIRE_MINUTES` to 1 in `auth.py`) → `GET /orders` with the same token → `401 Could not validate credentials` (expired)

**Walkthrough of the expiry test:** After expiry, `jwt.decode` checks the `exp` claim: `current_time > exp`. It is. `jwt.decode` raises `JWTError`. `decode_access_token` catches it and raises `ValueError`. `get_current_user` catches that and raises `HTTPException(401)`. FastAPI returns 401. The route handler is never reached.

**CS lens — the exp claim as a monotonically increasing bound.** The expiry check is a simple comparison: `current_time > exp`. The server's clock is the reference. If the server's clock is significantly wrong (NTP drift), tokens may expire early or late. In production, servers synchronise their clocks with NTP (Network Time Protocol). JWT-aware libraries also have a configurable "leeway" — a small time window (e.g., 10 seconds) within which an expired token is still accepted, accommodating minor clock skew between distributed servers.

---

## Connect the pieces

Authentication is complete on the backend. Every work order endpoint is protected. The flow: login → receive JWT → send JWT in every subsequent request → server verifies JWT and extracts user. Lesson 4 implements the frontend half: the React login form, token storage in `localStorage`, and the `Authorization` header on every fetch call.

---

## What breaks without this

**Forgetting `headers={"WWW-Authenticate": "Bearer"}` on the 401:** The OAuth2 specification requires this header when an authentication failure occurs. The `/docs` UI uses it to identify which endpoints need authentication and to display the lock icon. Without it, the docs UI does not recognise the endpoint as authenticated and does not provide the lock icon.

**Using `Depends(get_current_user)` as a default parameter instead of as `Depends(...)` syntax:** Writing `current_user = get_current_user` (missing `Depends`) calls `get_current_user` once at module load time, not per request, and crashes immediately because the database session is not available at load time.

---

## Definition of done

- [ ] `GET /orders` without a token returns `401 Not authenticated`
- [ ] `GET /orders` with a valid token returns the orders list
- [ ] The `/docs` UI shows lock icons on all work order endpoints
- [ ] An expired token returns `401 Could not validate credentials`
- [ ] You can explain why `get_current_user` uses the same error message for all failure cases
- [ ] You can explain what `OAuth2PasswordBearer` does
- [ ] You can explain why FastAPI calls `get_db` only once even though two dependencies use it

**Git commit:**

```
git add backend/auth.py backend/main.py
git commit -m "Protect work order endpoints: JWT authentication via Depends(get_current_user) on all five routes"
```
