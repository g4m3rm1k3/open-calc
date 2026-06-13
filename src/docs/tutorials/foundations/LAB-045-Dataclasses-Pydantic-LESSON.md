# FOUNDATIONS — LAB-045 — Python: Dataclasses and Pydantic

**Series:** FOUNDATIONS — Part VIII: Python Features
**Environment:** Python REPL. Install Pydantic: `pip install pydantic`
**Time:** 50–65 minutes.

---

## What You Will Build

A Python `@dataclass` that auto-generates `__init__`, `__repr__`, and `__eq__`, a Pydantic model that validates types and constraints at runtime, and a demonstration of the `ValidationError` raised with invalid data. After this lab you will understand when to use dataclasses (internal data, no external input) vs Pydantic (data from external sources like HTTP requests or config files).

---

## What You Need to Know First

**From LAB-041 (Type Hints):** Dataclasses and Pydantic both use type annotations as the source of truth for field types.

**From LAB-012 (Classes):** Dataclasses generate boilerplate that you would otherwise write manually.

---

> **Quick Check — try to answer before reading:**
>
> 1. What three methods does `@dataclass` generate automatically?
> 2. What happens when Pydantic receives the string `"42"` for a field typed `int`?
> 3. Why should validation (Pydantic) belong at the system boundary, not inside business logic?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Problem: Boilerplate in Plain Classes

```python
# Without dataclass — all this boilerplate for a simple data container:
class PointManual:
    def __init__(self, x: float, y: float, label: str = "") -> None:
        self.x = x
        self.y = y
        self.label = label

    def __repr__(self) -> str:
        return f"PointManual(x={self.x!r}, y={self.y!r}, label={self.label!r})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, PointManual):
            return NotImplemented
        return self.x == other.x and self.y == other.y and self.label == other.label
```

This is 14 lines for what is conceptually one data structure with three fields. Every change to the field list requires updating three methods. This is the boilerplate that dataclasses eliminate.

---

### Step 2 — `@dataclass`: Auto-Generated Methods

```python
from dataclasses import dataclass, field
from typing import ClassVar

@dataclass
class Point:
    x: float
    y: float
    label: str = ""   # default value

# @dataclass generates __init__, __repr__, and __eq__:
p1 = Point(3.0, 4.0)
p2 = Point(3.0, 4.0)
p3 = Point(1.0, 2.0, "origin")

print(p1)           # Point(x=3.0, y=4.0, label='')
print(p1 == p2)     # True — compares all fields
print(p1 == p3)     # False
print(p1.x)         # 3.0
```

**The walkthrough:** `@dataclass` inspects the class body at class definition time. For each annotated field, it generates the `__init__` parameter, the `__repr__` format string, and the `__eq__` comparison. The generated `__init__` respects default values.

**Frozen dataclass — immutable:**

```python
@dataclass(frozen=True)
class ImmutablePoint:
    x: float
    y: float

point = ImmutablePoint(3.0, 4.0)
point.x = 1.0  # raises FrozenInstanceError: cannot assign to field 'x'
# ImmutablePoint is hashable — can be used in sets and as dict keys
```

**`frozen=True`** generates `__hash__` and prevents field mutation. This is the equivalent of TypeScript's `Readonly<T>` — enforced at runtime rather than at compile time.

---

### Step 3 — `field()` for Complex Defaults

```python
from dataclasses import dataclass, field

@dataclass
class ShoppingCart:
    user_id: int
    items: list[str] = field(default_factory=list)  # NOT items: list = []
    total: float = 0.0
    is_checked_out: bool = False

cart1 = ShoppingCart(user_id=1)
cart2 = ShoppingCart(user_id=2)

cart1.items.append("apple")
print(cart1.items)  # ['apple']
print(cart2.items)  # [] — separate list per instance
```

**The walkthrough — why `default_factory`:** If you write `items: list = []`, ALL instances share the SAME list object as the default. Appending to `cart1.items` would also affect `cart2.items`. `default_factory=list` calls `list()` once per instance to create a fresh list. This is the mutable default argument bug in Python — `field(default_factory=...)` is the fix.

---

### Step 4 — Pydantic: Runtime Validation at System Boundaries

Dataclasses do not validate types — they accept whatever you pass. Pydantic validates:

```python
from pydantic import BaseModel, Field, validator
from typing import Optional

class UserCreateRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str
    age: int = Field(ge=0, le=150)   # ge: greater-than-or-equal, le: less-than-or-equal
    bio: Optional[str] = None

# Valid data:
user = UserCreateRequest(username="alice", email="alice@example.com", age=30)
print(user.username)  # "alice"
print(user.model_dump())
# {'username': 'alice', 'email': 'alice@example.com', 'age': 30, 'bio': None}

# Invalid data — Pydantic raises ValidationError:
from pydantic import ValidationError
try:
    bad_user = UserCreateRequest(
        username="ab",   # too short
        email="alice@example.com",
        age=-5           # negative
    )
except ValidationError as error:
    print(error)
# 2 validation errors for UserCreateRequest
# username
#   String should have at least 3 characters [input_value='ab', ...]
# age
#   Input should be greater than or equal to 0 [input_value=-5, ...]
```

**The walkthrough — ValidationError:** `ValidationError` lists every validation failure — not just the first. This is essential for API responses: the client receives all errors at once, not one at a time. The error structure includes the field name, the error message, the invalid input, and the rule that was violated.

**The CS lens — data validation as type narrowing:** Pydantic performs the same job as a TypeScript type guard but at runtime. After `user = UserCreateRequest(...)` succeeds, `user.age` is guaranteed to be an integer between 0 and 150. The validator has converted and validated the data. Code inside your application can trust the types without re-checking.

---

### Step 5 — Type Coercion

Pydantic coerces compatible types:

```python
# JSON arrives as strings, Pydantic coerces to the annotated type:
user = UserCreateRequest(username="alice", email="a@example.com", age="30")
print(type(user.age))   # <class 'int'> — "30" was coerced to 30
print(user.age)         # 30

# But wrong types that cannot be coerced raise ValidationError:
try:
    UserCreateRequest(username="alice", email="a@example.com", age="thirty")
except ValidationError as error:
    print(error)  # age: Input should be a valid integer, unable to parse string as an integer
```

**The SE lens — coercion at the boundary only:** Pydantic's coercion is appropriate at system boundaries where data arrives as strings (HTTP query params, JSON with wrong types, environment variables). Inside the application, use strict types — no coercion. This is the boundary pattern: validate and coerce exactly once at the entry point, then trust the internal types throughout.

**Dataclass vs Pydantic — the rule:**
- `@dataclass` for internal data structures that you control (domain objects, configuration computed from validated input)
- Pydantic for data from external sources (HTTP request bodies, config files, database rows from a generic ORM query)

---

## Connect the Pieces

- **FastAPI** uses Pydantic models as request body types. Defining `async def create_user(body: UserCreateRequest)` makes FastAPI automatically parse the JSON, validate it with Pydantic, and return a 422 error if validation fails — all without writing validation code.
- **Django REST Framework's serializers** solve the same problem as Pydantic but with a class-based API.
- **Pydantic Settings** (`pydantic-settings` library) validates environment variables using Pydantic models — the same validation at startup, not at request time.

---

## What Breaks Without This

**Mutable default in a dataclass:**

```python
@dataclass
class Cart:
    items: list = []  # DO NOT DO THIS

cart_a = Cart()
cart_b = Cart()
cart_a.items.append("apple")
print(cart_b.items)  # ['apple'] — cart_b is affected! Same list object.
```

Python creates one `[]` at class definition time. Every instance that uses the default gets the SAME list object. This is the mutable default argument bug — one of the most common Python gotchas. `field(default_factory=list)` creates a new list per instance.

---

## Definition of Done

- [ ] `@dataclass Point(x, y)` — `p1 == p2` when fields match, correct `repr`, generated `__init__`
- [ ] `frozen=True` — assigning to a field raises `FrozenInstanceError`
- [ ] `field(default_factory=list)` — two instances have independent lists
- [ ] `UserCreateRequest(age=-5)` raises `ValidationError` with a message about age
- [ ] `UserCreateRequest(age="30")` coerces the string to int successfully
- [ ] You can explain why Pydantic belongs at system boundaries, not inside business logic

**Git commit:**

```
git add src/
git commit -m "LAB-045: Python dataclasses and Pydantic — dataclasses eliminate boilerplate; Pydantic validates and coerces external data at system boundaries"
```

---

## Quick Check Answers

1. **`__init__`, `__repr__`, and `__eq__`.** `__init__` initialises the instance from positional/keyword arguments. `__repr__` returns a developer-readable string. `__eq__` compares two instances field by field. With `frozen=True`, `__hash__` is also generated.
2. **Pydantic coerces `"42"` to `42`.** If the annotation is `int` and the value is a string that can be parsed as an integer, Pydantic converts it. This is useful because HTTP query parameters and many external data sources represent numbers as strings. To prevent coercion, use `model_config = ConfigDict(strict=True)`.
3. **Business logic should trust its inputs.** If every function validates its arguments, validation logic is duplicated across the codebase (DRY violation) and the code is cluttered with error handling that is not part of the business rule. Validate once at the boundary, then trust the types internally. This is the same reason TypeScript's type system validates at compile time — once the type is established, every consumer trusts it without re-checking.
