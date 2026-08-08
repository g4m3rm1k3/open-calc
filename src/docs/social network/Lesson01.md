# Backend Lesson 1 — Project Setup and the User Model, Test-First

**Track:** Developer Social Network — Slice 1 (Backend)
**Depth:** Heavy — first real code in the project, so nothing is assumed beyond the Testing interlude
**Goal:** A running FastAPI project with a real `/users` endpoint for creating accounts, built entirely by writing failing tests first, backed by a real SQLite database, with Python type hints explained as they appear rather than used silently.

---

## 0. Why the User model is the actual starting point

No throwaway "hello world" endpoint here — the first thing built is the first thing the app actually needs: user accounts. Every other feature (posts, comments, notifications) depends on a `User` existing, so getting this right, understood, and tested is worth the extra care.

---

## 1. Project setup

```
mkdir dev-social-network && cd dev-social-network
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pydantic pytest httpx passlib[bcrypt]
```

Project structure — laid out now, filled in as the lesson goes:

```
dev-social-network/
  app/
    __init__.py
    main.py          # FastAPI app instance
    database.py       # SQLAlchemy setup
    models.py         # database table definitions
    schemas.py         # Pydantic request/response shapes
    routes/
      __init__.py
      users.py         # user-related endpoints
  tests/
    __init__.py
    test_users.py
```

**Why separate `models.py` from `schemas.py`, right from the start:** a `model` (SQLAlchemy) describes what's actually stored in the database. A `schema` (Pydantic) describes what a specific API request or response looks like. These are related but genuinely different things — not every database column should be exposed in an API response (a password hash, for instance), and not every API field maps directly to a column. Keeping them as separate files, from lesson 1, avoids a common beginner tangle where "the database shape" and "the API shape" get treated as the same thing until they need to diverge and everything breaks.

---

## 2. Python type hints — explained properly, since everything below uses them

```python
def add(a: int, b: int) -> int:
    return a + b
```

`a: int` and `b: int` tell you (and any tooling — your editor, type checkers) that this function expects integers. `-> int` tells you what it returns. **Type hints are not enforced at runtime by plain Python** — calling `add("hello", "world")` won't raise an error from the hints alone, since Python itself ignores them at execution time. Their value is: your editor can catch mismatches *before* you run the code, and they make function signatures genuinely self-documenting — a real, permanent readability upgrade over unlabeled `def add(a, b):`.

```python
from typing import Optional

def find_user(username: str) -> Optional[dict]:
    # returns a dict if found, or None if not - Optional[X] means "X or None"
    ...
```

`Optional[dict]` is shorthand for "this returns either a `dict` or `None`" — worth knowing since it shows up constantly for "might not find this" situations, which describes a lot of database lookups.

**FastAPI specifically uses type hints for real runtime behavior** — this is the one place in this lesson where hints do more than document intent:

```python
@app.get("/items/{item_id}")
def get_item(item_id: int):
    ...
```

FastAPI reads `item_id: int` and automatically converts the URL's text into a real integer, *and* automatically rejects the request with a clear error if someone passes something that isn't a valid integer — real validation, driven directly by the type hint, not just documentation.

---

## 3. The database layer — SQLAlchemy setup

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./dev_social_network.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    Provides one database session per request, and guarantees it's closed
    afterward - even if the request raises an error. This is a GENERATOR
    function (uses 'yield' instead of 'return'), which is what lets FastAPI's
    dependency injection system manage the session's lifecycle automatically.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Why `yield` instead of `return` here, explained:** a function using `yield` is a **generator** — instead of running to completion and handing back one value, it pauses at `yield`, hands control back to whoever called it, and can resume afterward. FastAPI's dependency injection system uses this pause point specifically: it runs everything before `yield` (creating the session), hands that session to your route function to use, and once the route is done — success *or* failure — it resumes this function *after* `yield`, running the `finally: db.close()` cleanup. This guarantees the database connection always gets closed properly, without every single route needing to remember to do it manually.

**`connect_args={"check_same_thread": False}`** — a SQLite-specific setting needed because SQLite normally restricts a connection to the thread that created it, which conflicts with how a web server handles multiple requests; this setting relaxes that restriction safely for this use case.

---

## 4. The User database model

```python
# app/models.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- **`primary_key=True`** — this column uniquely identifies each row; the database enforces no two rows can share an `id`.
- **`unique=True`** on `username` and `email` — the database itself refuses to store a duplicate, a real safety guarantee, not just an application-level check that could be bypassed.
- **`index=True`** — tells the database to build a fast lookup structure for this column, since you'll frequently search *by* username or email, not just store them. (This is worth remembering when Slice 3's Data Structures interlude covers what an index actually *is* underneath — for now, treat it as "makes lookups on this column fast.")
- **`hashed_password`, not `password`** — the actual plaintext password is never stored anywhere, ever (Section 5 covers why and how).

---

## 5. Password hashing — what it actually is, and why

Storing a user's actual password in the database is a serious, real security problem: if the database is ever compromised, every stored password is immediately exposed. **Hashing** solves this: a hash function takes the password and produces a scrambled, fixed-length output that's computationally impractical to reverse — you can check if a given password matches ("does hashing this input produce the stored hash?") without ever being able to recover the original password from the stored hash.

```python
# app/security.py
from passlib.context import CryptContext

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return password_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)
```

**`bcrypt` specifically** (rather than a plain hash like MD5 or SHA-256) is used because it's deliberately slow and includes a random "salt" baked into each hash — deliberate slowness makes large-scale password-guessing attacks impractical, and the salt means two users with the identical password get *different* stored hashes, preventing an attacker from spotting repeated passwords across accounts just by comparing hash values.

---

## 6. Pydantic schemas — the API's actual shape

```python
# app/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    """What a client sends to create a user."""
    username: str
    email: EmailStr   # Pydantic validates this is a real-looking email format
    password: str


class UserResponse(BaseModel):
    """What the API sends back - notice: NO password field, ever."""
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True   # allows building this schema directly from a SQLAlchemy model
```

**Why `UserResponse` deliberately excludes the password entirely** — not even the hashed version: there's no legitimate reason for an API response to ever include it, hashed or not, and explicitly defining the response shape this way makes that guarantee structural rather than something you have to remember to enforce manually on every single endpoint.

`EmailStr` is a Pydantic type that validates the string actually looks like a real email address format — a concrete, practical example of type hints doing real validation work (Section 2), not just documentation.

---

## 7. Test-first — writing the failing test before any endpoint exists

Following the Testing interlude's red-green-refactor cycle exactly:

```python
# tests/test_users.py
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

from app.main import app
from app.database import Base, get_db

# A separate, isolated test database - never touches the real one
TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_and_teardown_database():
    """Runs before AND after every single test, guaranteeing a clean slate each time."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


client = TestClient(app)


def test_create_user_returns_201_and_user_data():
    response = client.post("/users", json={
        "username": "alice",
        "email": "alice@example.com",
        "password": "supersecret123"
    })

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert "password" not in data          # Section 6's guarantee, verified
    assert "hashed_password" not in data


def test_create_user_rejects_duplicate_username():
    client.post("/users", json={"username": "bob", "email": "bob@example.com", "password": "password123"})
    response = client.post("/users", json={"username": "bob", "email": "different@example.com", "password": "password456"})

    assert response.status_code == 400
```

**Run this now** (`pytest tests/test_users.py -v`) — it will fail, because `app.main` and the `/users` route don't exist yet. This is Section 4 of the Testing interlude's "Red" step, made real. That failure is expected and correct.

**`@pytest.fixture(autouse=True)`** — a fixture is a reusable setup/teardown block; `autouse=True` means it runs automatically before and after *every* test in this file without needing to be explicitly requested. This specific fixture guarantees each test starts with an empty database and cleans up after itself — critical for `test_create_user_rejects_duplicate_username` to behave predictably regardless of what other tests ran before it.

**`app.dependency_overrides[get_db] = override_get_db`** — this is FastAPI's mechanism for swapping out a real dependency (the production database session from Section 3) for a test-only version, without changing a single line of the actual route code. This is *why* Section 3's `get_db` was written as a separate, swappable function in the first place, rather than hardcoded inline.

---

## 8. Green — the minimum code to make the tests pass

```python
# app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas, security

router = APIRouter()


@router.post("/users", response_model=schemas.UserResponse, status_code=201)
def create_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = security.hash_password(user_data.password)
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")

    db.refresh(new_user)
    return new_user
```

```python
# app/main.py
from fastapi import FastAPI
from app.database import Base, engine
from app.routes import users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Developer Social Network")
app.include_router(users.router)
```

Reading the key pieces:
- **`db: Session = Depends(get_db)`** — this is FastAPI's dependency injection: `Depends(get_db)` tells FastAPI "run `get_db` and hand me whatever it yields, for this one request." This is exactly the swappable mechanism Section 7 relied on for testing.
- **`response_model=schemas.UserResponse`** — FastAPI automatically converts the returned `User` database object into this shape *and* strips out any field not listed in `UserResponse` — this is the actual mechanism enforcing Section 6's "password never leaves the API" guarantee, not just a convention you have to remember.
- **`IntegrityError`** — this is the real, database-level error SQLAlchemy raises when a `unique=True` constraint (Section 4) is violated; catching it specifically is what turns a raw database failure into a clean, intentional `400` HTTP response instead of a confusing server crash.

**Run the tests again.** They should pass now — this is the "Green" step. Nothing here is more sophisticated than it needs to be to satisfy the tests; that's deliberate (Testing interlude, Section 4).

---

## 9. Refactor — a real cleanup pass, tests as the safety net

One genuine improvement worth making: right now, a validation error from Pydantic (e.g., a malformed email) and a duplicate-username error both eventually surface as HTTP errors, but through different paths, with different levels of intentionality. Left as-is for now — deliberately — since Section 3 of the Testing interlude warned against gold-plating past what the tests actually require. A more thorough refactor (custom exception types, a dedicated error-handling layer) is a natural target for a later architecture lesson, once there's more code and more error cases to justify the added structure. **Noticing "this could be improved, but isn't necessary yet" and moving on is itself a real engineering skill** — not every refactor opportunity needs to be taken immediately.

---

## 10. Challenges before the frontend lesson

1. Write a new failing test first: `test_create_user_rejects_invalid_email`, checking that posting `{"username": "carl", "email": "not-an-email", "password": "password123"}` returns a `422` status code (Pydantic's default validation-failure status). Run it — does it pass immediately, or does something need to change? Explain why, based on Section 6.
2. Add a test verifying that two different users with the *same password* end up with *different* `hashed_password` values in the database (you'll need a way to query the test database directly to check this). Tie your explanation back to Section 5's salting discussion.
3. In your own words, explain why `UserCreate` and `UserResponse` are two separate Pydantic classes instead of one shared class — referencing Section 1's models-vs-schemas distinction.
4. `test_create_user_rejects_duplicate_username` currently only checks the username. Extend it (or write a sibling test) to also verify duplicate *emails* are rejected, following the same red-green pattern.

---

## What's next

The frontend lesson builds the signup form that calls this exact endpoint — React + TypeScript project setup, JSX explained from zero, controlled form inputs, and a test-first approach on the frontend side too, using Vitest. Say the word when you're ready.
