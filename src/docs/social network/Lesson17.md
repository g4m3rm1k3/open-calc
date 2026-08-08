# Interlude — Software Architecture II: Clean/Hexagonal Architecture

**Track:** Developer Social Network — Slice 6 (Architecture, applied to existing code)
**Depth:** Heavy — this is a real refactor of code you've already written and tested, not a new feature
**Goal:** Understand what "clean" or "hexagonal" architecture actually means beyond the buzzwords, refactor the User and Post routes to separate business logic from both the web framework and the database, and develop honest judgment about when this level of structure is worth it.

---

## 0. What's actually been informally true since Backend Lesson 1

Backend Lesson 1's models-vs-schemas split, and Slice 2's Repository Pattern interlude, already started this direction. This lesson names the fuller version of that idea and pushes it further: **your business logic shouldn't know or care whether it's being called from a FastAPI route, a CLI script, or a test** — and it definitely shouldn't be tangled up with SQLAlchemy-specific query syntax. Right now, `create_user` and `create_post` mix three concerns in one function: parsing the HTTP request, business rules (is this username taken?), and raw database access. Clean architecture is the discipline of pulling those apart.

---

## 1. The core idea — dependency direction, not just "more files"

The actual principle, stripped of jargon: **business logic should depend on nothing except itself.** The database, the web framework, external services — all of those should depend *on* your business logic's interfaces, never the other way around. This is often drawn as concentric circles:

```
    [ Routes / HTTP layer ]         <- knows about FastAPI, HTTP status codes
         depends on
    [ Service layer ]                <- business rules, knows NOTHING about HTTP or SQL
         depends on
    [ Repository interface ]         <- an abstract "how to get/save data" contract
         implemented by
    [ SQLAlchemy repository ]        <- knows about SQL, sessions, ORM specifics
```

The arrows point *inward* — outer layers depend on inner ones, never the reverse. The **service layer**, sitting at the core, doesn't import FastAPI, doesn't import SQLAlchemy directly — it just expresses business rules in plain Python, against an abstract repository interface it doesn't know or care how is actually implemented.

**Why this direction, specifically, matters:** if business logic depended on SQLAlchemy directly (as it currently does), switching databases, or testing business rules without a real database, becomes hard. If it depends only on an abstract interface, you can swap the real repository for an in-memory fake during tests, or swap SQLAlchemy for a different database library entirely, without touching a single line of actual business logic.

---

## 2. Refactoring `User` creation — before and after

**Before** (Backend Lesson 1's version — everything tangled together in the route):

```python
@router.post("/users", response_model=schemas.UserResponse, status_code=201)
def create_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = security.hash_password(user_data.password)
    new_user = models.User(username=user_data.username, email=user_data.email, hashed_password=hashed_password)
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")
    db.refresh(new_user)
    return new_user
```

**After — the repository interface** (an abstract contract, no implementation):

```python
# app/repositories/user_repository.py
from abc import ABC, abstractmethod
from app import models


class UserRepository(ABC):
    """An abstract contract: 'anything that can save and find users.'
    Contains ZERO SQL, ZERO SQLAlchemy - just what operations must exist."""

    @abstractmethod
    def find_by_username(self, username: str) -> models.User | None:
        ...

    @abstractmethod
    def save(self, user: models.User) -> models.User:
        ...
```

`ABC` (Abstract Base Class) and `@abstractmethod` — Python's built-in way of defining an interface: a class that can't be instantiated directly, only subclassed, and every subclass *must* implement every method marked `@abstractmethod` or Python raises an error. This is what makes `UserRepository` a genuine contract, not just a suggestion.

**After — the real SQLAlchemy implementation:**

```python
# app/repositories/sqlalchemy_user_repository.py
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app import models


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    def find_by_username(self, username: str) -> models.User | None:
        return self.db.query(models.User).filter(models.User.username == username).first()

    def save(self, user: models.User) -> models.User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
```

**After — the service layer, business rules, no HTTP or SQL knowledge at all:**

```python
# app/services/user_service.py
from app.repositories.user_repository import UserRepository
from app import models, security


class UsernameAlreadyExistsError(Exception):
    """A plain Python exception - the service layer doesn't know what an HTTPException is."""
    pass


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(self, username: str, email: str, password: str) -> models.User:
        existing = self.user_repository.find_by_username(username)
        if existing is not None:
            raise UsernameAlreadyExistsError(username)

        new_user = models.User(username=username, email=email, hashed_password=security.hash_password(password))
        return self.user_repository.save(new_user)
```

**After — the route, now just translation between HTTP and the service layer:**

```python
# app/routes/users.py
from app.services.user_service import UserService, UsernameAlreadyExistsError
from app.repositories.sqlalchemy_user_repository import SqlAlchemyUserRepository


@router.post("/users", response_model=schemas.UserResponse, status_code=201)
def create_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(SqlAlchemyUserRepository(db))
    try:
        return user_service.register_user(user_data.username, user_data.email, user_data.password)
    except UsernameAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Username already exists")
```

**What actually changed, and why it's worth the extra files:** `UserService.register_user` contains the real business rule ("usernames must be unique") in plain, framework-free Python, testable with zero HTTP layer and zero real database involved (Section 3). The route's only job now is translating an HTTP request into a service call, and a service exception into an HTTP error — exactly the "routes as thin translation layer" principle Section 1 described.

---

## 3. The actual payoff — testing business logic with a fake repository

```python
# tests/test_user_service.py
from app.services.user_service import UserService, UsernameAlreadyExistsError
from app.repositories.user_repository import UserRepository
from app import models


class FakeUserRepository(UserRepository):
    """An in-memory fake - implements the SAME interface as the real SQLAlchemy version,
    but with a plain Python dict instead of a real database. No SQLAlchemy, no test database, at all."""

    def __init__(self):
        self.users_by_username: dict[str, models.User] = {}

    def find_by_username(self, username):
        return self.users_by_username.get(username)

    def save(self, user):
        self.users_by_username[user.username] = user
        return user


def test_register_user_succeeds_with_new_username():
    service = UserService(FakeUserRepository())
    user = service.register_user("alice", "alice@example.com", "password123")
    assert user.username == "alice"


def test_register_user_rejects_duplicate_username():
    service = UserService(FakeUserRepository())
    service.register_user("bob", "bob@example.com", "password123")

    try:
        service.register_user("bob", "different@example.com", "password456")
        assert False, "expected UsernameAlreadyExistsError to be raised"
    except UsernameAlreadyExistsError:
        pass   # expected
```

**This is the concrete payoff of Section 1's dependency direction, made real:** these tests run in milliseconds, need no database connection, no FastAPI test client, no HTTP at all — because `UserService` never depended on any of that in the first place, only on the abstract `UserRepository` interface, which `FakeUserRepository` satisfies just as validly as the real SQLAlchemy version does. This is exactly the kind of fast, isolated **unit test** the Testing interlude's pyramid (Section 2 there) argued you should have many of.

---

## 4. The honest judgment call — is this worth it here?

This is worth being genuinely honest about, not just accepting the refactor as automatically correct: for a project this size, with one database and one API, is three files (interface, implementation, service) genuinely better than the original one-function version?

**The case for it:** business logic becomes independently testable (Section 3), and if this project ever needed to support a second database, or add a CLI admin tool that also needs to register users, the `UserService` is immediately reusable without touching a line of it.

**The case against it, honestly:** more files, more indirection, a real learning curve for anyone new to the codebase, and — for a project that will only ever have one database and one interface — some of this abstraction may never actually get exercised. This is a genuine, real tradeoff in software engineering, not a settled question with one right answer: over-applying this pattern to every single piece of a small project is a real, common mistake (sometimes called over-engineering), just as under-applying it to a genuinely complex, evolving system causes real pain later.

**The judgment call for this project, stated explicitly:** apply this pattern to `User` and `Post` (Challenge 1) — the two models most likely to grow more complex business rules over time — and leave `Notification` in its simpler, Backend Lesson 5 form for now, since its logic is genuinely thin. Revisiting that decision if `Notification` grows more complex later is a reasonable, deliberate choice, not a shortcut being papered over.

---

## 5. Challenges

1. Apply the exact same refactor from Section 2 to `Post` creation: a `PostRepository` interface, a `SqlAlchemyPostRepository`, a `PostService`, and a route reduced to translation. Write a `FakePostRepository`-based unit test for it, following Section 3's pattern.
2. Run the *existing* integration tests (`tests/test_users.py`, using the real `TestClient` and a real test database) after the refactor. They should still pass, completely unmodified — if they don't, that's a sign the refactor changed real behavior, not just internal structure, which would be a bug in the refactor itself.
3. In your own words, explain why `UsernameAlreadyExistsError` is a plain Python `Exception`, not an `HTTPException`, given where it's raised (inside `UserService`) versus where it's caught (inside the route). Tie this to Section 1's "business logic shouldn't know about HTTP" principle.
4. Section 4 argues this pattern is worth applying to `User` and `Post` but not yet to `Notification`. Do you agree with that specific line, or would you draw it differently? There's no single right answer — the value is in articulating your own reasoning, the same way Section 4 articulated its own.

---

## What's next

The Domain-Driven Design interlude next — aggregates and bounded contexts, applied by identifying the real domain boundaries between User, Post, and Notification that this architectural refactor has now made visible as separate services. Say the word when you're ready.
