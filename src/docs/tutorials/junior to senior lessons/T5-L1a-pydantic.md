# Junior to Senior — T5·L1a — Pydantic v2

**Prerequisites:** T5·L0k (Advanced Type Hints). You understand `TypeVar`,
`Generic[T]`, and `TypedDict`. This lesson covers Pydantic v2 — the validation
library that FastAPI uses for request bodies, responses, and configuration.

**What this lab adds:**
- `BaseModel`: auto-generates `__init__`, `__repr__`, validation — from field declarations
- `Field(alias=..., ge=0, min_length=1)`: per-field constraints and metadata
- `@field_validator`: custom validation and transformation for one field
- `@model_validator(mode='after')`: cross-field validation after all fields are set
- `model_dump()` and `model_validate()`: serialisation and deserialisation
- `ConfigDict(frozen=True, extra='forbid')`: model-level settings

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A Pydantic model receives `{'title': 123}` where `title: str` is expected.
>    Does Pydantic raise an error, or does it coerce `123` to `'123'`?
> 2. You write `priority: str` on a Pydantic model. How do you restrict it to
>    only `'low'`, `'medium'`, or `'high'`?
> 3. `model_dump()` is called. The field `due_date: date | None = None` holds
>    `date(2025, 12, 31)`. What does `model_dump()` return for that field — a `date`
>    object or the string `'2025-12-31'`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Request and response models for the task API that validate input automatically:

```python
>>> CreateTaskRequest(title='', priority='high')
ValidationError: 1 validation error for CreateTaskRequest
title: String should have at least 1 character

>>> CreateTaskRequest(title='Write tests', priority='URGENT')
ValidationError: ... Input should be 'low', 'medium' or 'high'

>>> body = CreateTaskRequest(title='  Write tests  ', priority='high')
>>> body.title    # stripped automatically
'Write tests'
>>> body.model_dump()
{'title': 'Write tests', 'priority': 'high', 'due_date': None, 'tags': []}
```

---

### Concept: The Problem Pydantic Solves

**What it is:** Pydantic validates Python data at construction time and raises a
detailed error if anything is wrong — before the data reaches your application logic.

**The problem before (validating API request bodies manually):**

```python
def create_task_endpoint(body: dict) -> dict:
    # Manual validation — tedious and incomplete:
    if 'title' not in body:
        return {'error': 'title is required'}, 400
    if not isinstance(body['title'], str):
        return {'error': 'title must be a string'}, 422
    if not body['title'].strip():
        return {'error': 'title cannot be empty'}, 422
    priority = body.get('priority', 'medium')
    if priority not in ('low', 'medium', 'high'):
        return {'error': f'invalid priority: {priority}'}, 422
    # ... 20 more lines of validation for 3 fields
```

This must be written for every endpoint. Any new field requires updating validation.
Missing validation → silent data corruption.

**The solution — Pydantic model:**

```python
from pydantic import BaseModel, Field

class CreateTaskRequest(BaseModel):
    title:    str   = Field(..., min_length=1, max_length=200)
    priority: str   = Field(default='medium', pattern=r'^(low|medium|high)$')

# FastAPI/Pydantic validates automatically:
body = CreateTaskRequest(**incoming_data)
# If data is invalid: raises ValidationError with ALL errors described
# If data is valid: body.title is guaranteed to be a non-empty string ≤200 chars
```

**What it hides:** All validation logic, type coercion, default value handling, and error
message generation. One field declaration replaces 10+ lines of manual validation.

**The invariant Pydantic protects:** After `CreateTaskRequest(...)` succeeds, every field
holds a value that satisfies its declared constraints. No invalid state is possible once
construction completes.

**Canonical example:** A customs form. The form defines what information is required and
what's valid (passport number format, declared value range). Pydantic is the form —
and the customs officer who checks it. If the form is invalid, you can't proceed.

**You will see this again in:**
- FastAPI: every route that takes a `body: SomeModel` parameter uses Pydantic automatically
- SQLAlchemy with Pydantic integration: model ↔ database row conversion
- Configuration: `BaseSettings` (already covered in T5-L0) is a Pydantic model
- Standard in every FastAPI codebase

**Watch for:** Pydantic v2 (current) and v1 have different APIs. The `@validator`
decorator from v1 is replaced by `@field_validator` in v2. If you see `@validator`,
you are reading v1 documentation.

---

## Step 1 — See the Problem First

```bash
python -c "
# Without Pydantic — what you receive from an API can be anything:
body = {'title': 123, 'priority': 'URGENT', 'extra': 'should not be here'}
# You'd have to validate manually:
title = body.get('title')
if not isinstance(title, str):
    title = str(title)   # coerce — but should it? What about None?
print('silently stored:', type(title), repr(title))
"
```

**You should see:** `silently stored: <class 'str'> '123'` — an integer was silently
coerced to a string. With Pydantic in strict mode, this would fail; in lax mode, it's
a deliberate coercion. Either way, you control the behaviour explicitly.

---

### Concept: `BaseModel` — Validation From Declarations

**What it is:** `BaseModel` is a Pydantic class that reads field annotations and
generates `__init__`, `__repr__`, `__eq__`, and validation methods automatically —
similar to `@dataclass` but with built-in validation.

**Key differences from `@dataclass`:**
- `@dataclass`: no validation by default, uses Python's type system at runtime
- `BaseModel`: validates types and constraints at construction time, raises `ValidationError`
- `BaseModel`: coerces compatible types (e.g., string `'42'` → `int 42`) in lax mode

```python
from pydantic import BaseModel
from datetime import date

class CreateTaskRequest(BaseModel):
    title:    str
    priority: str       = 'medium'     # default value
    due_date: date | None = None       # optional, defaults to None
```

```python
# Valid:
body = CreateTaskRequest(title='Write tests', priority='high')
body.title     # → 'Write tests'
body.priority  # → 'high'
body.due_date  # → None

# Coercion in lax mode (default):
CreateTaskRequest(title=123)          # coerces 123 → '123'

# Invalid:
CreateTaskRequest(priority='active')  # ValidationError — no title (required)
```

**Smallest possible example:**

```python
from pydantic import BaseModel

class Point(BaseModel):
    x: float
    y: float

p = Point(x=1.0, y=2.0)
p.model_dump()   # → {'x': 1.0, 'y': 2.0}
Point(x='not-a-number', y=2.0)  # → ValidationError
```

**You will see this again in:**
- Every FastAPI endpoint body parameter
- Pydantic `BaseSettings` (T5-L0) is a subclass of this
- Response models: `response_model=TaskResponse` in FastAPI uses Pydantic

**Watch for:** `BaseModel` generates `__init__` from field declarations. DO NOT write
your own `__init__` — it overrides Pydantic's and breaks validation. Use `__post_init__`
equivalent (`model_post_init`) or `@model_validator` instead.

---

## Step 2 — Create the First Model

Install Pydantic if not already installed:

```bash
pip install pydantic
```

Create `src/api/models.py`:

```python
# src/api/models.py
from pydantic import BaseModel
```

### SAVE AND TRY

```bash
python -c "from src.api.models import *; print('imports OK')"
```

Add `CreateTaskRequest` with just required fields first:

```python
# src/api/models.py
from pydantic import BaseModel


class CreateTaskRequest(BaseModel):
    title:    str
    priority: str = 'medium'
```

### SAVE AND TRY

```bash
python -c "
from src.api.models import CreateTaskRequest
from pydantic import ValidationError

# Valid:
body = CreateTaskRequest(title='Write tests', priority='high')
print(body.title, body.priority)

# Missing required field:
try:
    CreateTaskRequest(priority='high')
except ValidationError as e:
    print('Missing title:')
    for error in e.errors():
        print(' ', error['loc'], error['msg'])
"
```

**You should see:**
```
Write tests high
Missing title:
  ('title',) Field required
```

---

### Concept: `Field` — Per-Field Constraints

**What it is:** `Field(...)` adds validation constraints, default values, aliases,
and documentation to individual fields.

**The problem before:**

```python
class CreateTaskRequest(BaseModel):
    title:    str   # accepts '' — empty strings slip through
    priority: str   # accepts 'garbage' — any string is valid
```

**The solution:**

```python
from pydantic import BaseModel, Field

class CreateTaskRequest(BaseModel):
    title:    str = Field(..., min_length=1, max_length=200)
    # ...     ↑ required (no default), ≥1 char, ≤200 chars
    priority: str = Field(default='medium', pattern=r'^(low|medium|high)$')
    # ↑ default, regex pattern enforced
```

**Common `Field` parameters:**

| Parameter | What it enforces | Example |
|---|---|---|
| `...` (first pos.) | Required (no default) | `Field(...)` |
| `default=x` | Default value | `Field(default='medium')` |
| `min_length=n` | Minimum string length | `Field(min_length=1)` |
| `max_length=n` | Maximum string length | `Field(max_length=200)` |
| `pattern=r'...'` | Regex pattern the value must match | `Field(pattern=r'^[a-z]+$')` |
| `ge=n` | Greater than or equal (numbers) | `Field(ge=0)` |
| `le=n` | Less than or equal (numbers) | `Field(le=100)` |
| `alias='name'` | JSON key name | `Field(alias='taskId')` |

**Project application:** `title: str = Field(..., min_length=1, max_length=200)` — the title
must exist, be at least one character, and be at most 200 characters.

**Smallest possible example:**

```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    name:  str   = Field(..., min_length=1, description='Product name')
    price: float = Field(..., ge=0, le=10_000)
    qty:   int   = Field(default=0, ge=0)

Product(name='Widget', price=9.99)   # valid
Product(name='',       price=9.99)   # ValidationError: min_length
Product(name='Widget', price=-1.0)   # ValidationError: ge=0
```

**You will see this again in:**
- Every professional FastAPI codebase uses `Field` for all request/response models
- `BaseSettings` uses `Field` for environment variable aliases and constraints
- Pydantic's OpenAPI schema generation reads `Field` metadata to document the API

**Watch for:** `Field(...)` — the `...` (Ellipsis) is how you say "required, no default."
`Field()` without `...` is also valid for no-constraint fields. `Field(default=None)` is
equivalent to `= None`.

---

## Step 3 — Add Constraints to `CreateTaskRequest`

Update `src/api/models.py`:

```python
# src/api/models.py
from pydantic import BaseModel, Field


class CreateTaskRequest(BaseModel):
    title:    str            = Field(..., min_length=1, max_length=200)   # ← add constraints
    priority: str            = Field(default='medium', pattern=r'^(low|medium|high)$')
    due_date: str | None     = Field(default=None)
    tags:     list[str]      = Field(default_factory=list)
```

### SAVE AND TRY

```bash
python -c "
from src.api.models import CreateTaskRequest
from pydantic import ValidationError

tests = [
    {'title': ''},           # empty title
    {'title': 'ok', 'priority': 'URGENT'},  # bad priority
    {'title': 'ok'},         # valid with defaults
]

for data in tests:
    try:
        body = CreateTaskRequest(**data)
        print('VALID:', body.model_dump())
    except ValidationError as e:
        errors = [(err['loc'], err['msg']) for err in e.errors()]
        print('INVALID:', errors)
"
```

**You should see:**
```
INVALID: [('title',), 'String should have at least 1 character']
INVALID: [('priority',), "String should match pattern '^(low|medium|high)$'"]
VALID: {'title': 'ok', 'priority': 'medium', 'due_date': None, 'tags': []}
```

---

### Concept: `@field_validator` — Custom Field Validation

**What it is:** `@field_validator('field_name')` runs a method before or after
Pydantic's built-in validation. Use it to: transform values, run complex validation,
or convert between types.

**The problem before — regex is too strict:**

```python
class CreateTaskRequest(BaseModel):
    priority: str = Field(default='medium', pattern=r'^(low|medium|high)$')
    # 'HIGH' fails — but the user might type uppercase. We want to accept it.
    # The regex pattern cannot normalise — only validate.
```

**The solution — `@field_validator` transforms the value:**

```python
from pydantic import BaseModel, field_validator

class CreateTaskRequest(BaseModel):
    priority: str = 'medium'

    @field_validator('priority', mode='before')
    @classmethod
    def normalise_priority(cls, v: str) -> str:
        lowered = v.lower()
        valid = {'low', 'medium', 'high'}
        if lowered not in valid:
            raise ValueError(f'Priority must be one of {valid}. Got {v!r}.')
        return lowered   # ← transform: lowercase before storing
```

**`mode='before'`** — runs before Pydantic's type validation.
**`mode='after'`** — runs after Pydantic has already validated the type.

**What it hides:** The two-step validate-then-store pattern. The decorator wires the
method into Pydantic's validation pipeline so it runs automatically on construction.

**Project application:** `normalise_priority` accepts `'HIGH'`, `'Medium'`, `'low'`
and stores the lowercase version. `title_not_whitespace` strips and validates the title.

**Smallest possible example:**

```python
from pydantic import BaseModel, field_validator

class Username(BaseModel):
    name: str

    @field_validator('name')
    @classmethod
    def must_be_lowercase(cls, v: str) -> str:
        if v != v.lower():
            raise ValueError('Username must be lowercase')
        return v

Username(name='alice')   # valid — stored as 'alice'
Username(name='Alice')   # ValidationError: must be lowercase
```

**You will see this again in:**
- Normalising email addresses (always lowercase)
- Parsing ISO date strings into `datetime` objects
- Converting string enum names to enum members
- Any transformation that should happen before the data is stored

**Watch for:** `@field_validator` and `@classmethod` must BOTH be present, in that order.
Forgetting `@classmethod` raises `PydanticUserError`.

---

## Step 4 — Add `@field_validator` to `CreateTaskRequest`

Update `src/api/models.py`:

```python
# src/api/models.py
from pydantic import BaseModel, Field, field_validator   # ← add field_validator


class CreateTaskRequest(BaseModel):
    title:    str        = Field(..., min_length=1, max_length=200)
    priority: str        = Field(default='medium')    # ← remove pattern — validator handles it
    due_date: str | None = Field(default=None)
    tags:     list[str]  = Field(default_factory=list)

    @field_validator('title')                        # ← add this validator
    @classmethod
    def title_must_not_be_whitespace_only(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError('Title cannot be whitespace only')
        return stripped   # ← strip whitespace — transformed before storage

    @field_validator('priority', mode='before')      # ← add this validator
    @classmethod
    def normalise_and_validate_priority(cls, v: str) -> str:
        lowered = str(v).lower()
        valid   = {'low', 'medium', 'high'}
        if lowered not in valid:
            raise ValueError(f'Priority must be one of {valid}. Got {v!r}.')
        return lowered
```

### SAVE AND TRY

```bash
python -c "
from src.api.models import CreateTaskRequest

# Title is stripped:
body = CreateTaskRequest(title='  Write tests  ', priority='high')
print(body.title)    # 'Write tests' — stripped

# Priority normalised:
body2 = CreateTaskRequest(title='Test', priority='HIGH')
print(body2.priority)   # 'high' — lowercased

# Still validates:
from pydantic import ValidationError
try:
    CreateTaskRequest(title='Test', priority='URGENT')
except ValidationError as e:
    print('invalid priority caught')
"
```

**You should see:**
```
Write tests
high
invalid priority caught
```

---

### Concept: `@model_validator(mode='after')` — Cross-Field Validation

**What it is:** A `@model_validator` runs after ALL fields are set. Use it to
validate rules that span multiple fields — e.g., "start_date must be before end_date."

**The problem before:**

```python
class DateRange(BaseModel):
    start_date: date
    end_date:   date
    # No way to check end_date > start_date in a field_validator
    # because field validators see one field at a time
```

**The solution:**

```python
from pydantic import model_validator

class DateRange(BaseModel):
    start_date: date
    end_date:   date

    @model_validator(mode='after')
    def end_must_be_after_start(self) -> 'DateRange':
        if self.end_date <= self.start_date:
            raise ValueError('end_date must be after start_date')
        return self   # must return self
```

**What it hides:** The ordering of validation. `mode='after'` guarantees that when
this method runs, all field validations have already passed. `self.start_date` and
`self.end_date` are already valid `date` objects — no type checking needed here.

**Project application:** `due_date` must be after `start_date` if both are provided.

**Smallest possible example:**

```python
from pydantic import BaseModel, model_validator

class Range(BaseModel):
    low:  int
    high: int

    @model_validator(mode='after')
    def high_must_exceed_low(self) -> 'Range':
        if self.high <= self.low:
            raise ValueError('high must be greater than low')
        return self

Range(low=1, high=5)   # valid
Range(low=5, high=1)   # ValidationError: high must be greater than low
```

**You will see this again in:**
- Password confirmation: `password == password_confirm`
- Mutual exclusivity: "only one of field_a or field_b can be set"
- Any constraint that requires comparing two or more fields

**Watch for:** `mode='after'` validators receive `self` (the model instance with all
fields). `mode='before'` validators receive the raw data dict. Always `return self`
from a `mode='after'` validator — not doing so makes the model `None`.

---

## Step 5 — Build All Models and Write Tests

Complete `src/api/models.py`:

```python
# src/api/models.py
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


class CreateTaskRequest(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)   # ← model settings

    title:    str        = Field(..., min_length=1, max_length=200)
    priority: str        = Field(default='medium')
    due_date: str | None = Field(default=None)
    tags:     list[str]  = Field(default_factory=list)

    @field_validator('title')
    @classmethod
    def title_must_not_be_whitespace_only(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be whitespace only')
        return v.strip()

    @field_validator('priority', mode='before')
    @classmethod
    def normalise_and_validate_priority(cls, v: str) -> str:
        lowered = str(v).lower()
        if lowered not in {'low', 'medium', 'high'}:
            raise ValueError(f'Priority must be low, medium, or high. Got {v!r}.')
        return lowered


class UpdateTaskRequest(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)

    title:    str | None  = Field(default=None, min_length=1, max_length=200)
    priority: str | None  = Field(default=None)
    done:     bool | None = None

    @field_validator('priority', mode='before')
    @classmethod
    def normalise_priority_if_present(cls, v: str | None) -> str | None:
        if v is None:
            return None
        lowered = str(v).lower()
        if lowered not in {'low', 'medium', 'high'}:
            raise ValueError(f'Priority must be low, medium, or high. Got {v!r}.')
        return lowered


class TaskResponse(BaseModel):
    model_config = ConfigDict(frozen=True, populate_by_name=True)

    id:       str
    title:    str
    priority: str
    done:     bool
    due_date: str | None = None
    tags:     list[str]  = Field(default_factory=list)
```

Create `tests/test_api_models.py`:

```python
# tests/test_api_models.py
import pytest
from pydantic import ValidationError
from src.api.models import CreateTaskRequest, UpdateTaskRequest, TaskResponse


class TestCreateTaskRequest:

    def test_creates_with_valid_data(self) -> None:
        body = CreateTaskRequest(title='Write tests', priority='high')
        assert body.title    == 'Write tests'
        assert body.priority == 'high'

    def test_default_priority_is_medium(self) -> None:
        body = CreateTaskRequest(title='Write tests')
        assert body.priority == 'medium'

    def test_strips_whitespace_from_title(self) -> None:
        body = CreateTaskRequest(title='  Write tests  ')
        assert body.title == 'Write tests'

    def test_raises_for_empty_title(self) -> None:
        with pytest.raises(ValidationError) as exc:
            CreateTaskRequest(title='')
        assert 'title' in str(exc.value).lower()

    def test_raises_for_whitespace_only_title(self) -> None:
        with pytest.raises(ValidationError):
            CreateTaskRequest(title='   ')

    def test_raises_for_invalid_priority(self) -> None:
        with pytest.raises(ValidationError) as exc:
            CreateTaskRequest(title='Write tests', priority='urgent')
        assert 'Priority' in str(exc.value)

    def test_normalises_priority_to_lowercase(self) -> None:
        body = CreateTaskRequest(title='Write tests', priority='HIGH')
        assert body.priority == 'high'

    def test_raises_for_extra_fields(self) -> None:
        with pytest.raises(ValidationError):
            CreateTaskRequest(title='Write tests', unknown_field='x')

    def test_model_dump_returns_dict_with_all_fields(self) -> None:
        body = CreateTaskRequest(title='Write tests')
        d    = body.model_dump()
        assert isinstance(d, dict)
        assert d['title']    == 'Write tests'
        assert d['priority'] == 'medium'
        assert d['due_date'] is None

    def test_model_validate_creates_from_dict(self) -> None:
        body = CreateTaskRequest.model_validate({'title': 'Deploy', 'priority': 'low'})
        assert body.title == 'Deploy'


class TestUpdateTaskRequest:

    def test_all_fields_are_optional(self) -> None:
        body = UpdateTaskRequest()
        assert body.title    is None
        assert body.priority is None
        assert body.done     is None

    def test_accepts_partial_update(self) -> None:
        body = UpdateTaskRequest(title='New title')
        assert body.title == 'New title'
        assert body.done  is None

    def test_validates_priority_when_provided(self) -> None:
        with pytest.raises(ValidationError):
            UpdateTaskRequest(priority='urgent')


class TestTaskResponse:

    def test_creates_response_model(self) -> None:
        resp = TaskResponse(id='t-1', title='Write tests', priority='high', done=False)
        assert resp.id == 't-1'

    def test_is_immutable_because_frozen(self) -> None:
        resp = TaskResponse(id='t-1', title='Write tests', priority='high', done=False)
        with pytest.raises(Exception):
            resp.title = 'Changed'   # type: ignore[misc]
```

### SAVE AND TRY

```bash
pytest tests/test_api_models.py -v
```

**You should see:**
```
tests/test_api_models.py::TestCreateTaskRequest::test_creates_with_valid_data PASSED
...
tests/test_api_models.py::TestTaskResponse::test_is_immutable_because_frozen PASSED

13 passed
```

**Change something:** Set `ConfigDict(extra='ignore')` instead of `extra='forbid'` on
`CreateTaskRequest`. Rerun `test_raises_for_extra_fields`. Expected: test FAILS — the
extra field is now silently ignored instead of raising. Change back to `extra='forbid'`.

---

## 🎯 Challenge: Add Cross-Field Date Validation

**You know:** `@model_validator(mode='after')`, Pydantic models.

**Task:** Add `start_date: date | None = None` to `CreateTaskRequest`. Add a
`@model_validator` that raises if both `due_date` and `start_date` are provided and
`due_date <= start_date`.

Note: `due_date` is currently `str | None`. Change it to `date | None` to enable
date comparison.

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
from datetime import date
from pydantic import model_validator

class CreateTaskRequest(BaseModel):
    title:      str        = Field(..., min_length=1, max_length=200)
    priority:   str        = Field(default='medium')
    due_date:   date | None = None    # changed from str | None
    start_date: date | None = None    # new field
    tags:       list[str]  = Field(default_factory=list)

    # ... existing validators ...

    @model_validator(mode='after')
    def due_date_must_be_after_start_date(self) -> 'CreateTaskRequest':
        if self.due_date is not None and self.start_date is not None:
            if self.due_date <= self.start_date:
                raise ValueError('due_date must be after start_date')
        return self
```

**Tests:**
```python
def test_valid_when_due_after_start() -> None:
    from datetime import date
    body = CreateTaskRequest(
        title='Task',
        start_date=date(2025, 1, 1),
        due_date=date(2025, 1, 15),
    )
    assert body.due_date == date(2025, 1, 15)

def test_valid_when_no_dates() -> None:
    body = CreateTaskRequest(title='Task')
    assert body.start_date is None

def test_raises_when_due_before_start() -> None:
    from datetime import date
    with pytest.raises(ValidationError, match='due_date'):
        CreateTaskRequest(
            title='Task',
            start_date=date(2025, 1, 15),
            due_date=date(2025, 1, 1),
        )
```

</details>

---

## Final Check

| Feature | What to test |
|---|---|
| `BaseModel` validates on construction | Missing required field raises `ValidationError` |
| `Field(min_length=1)` | Empty string raises `ValidationError` |
| `@field_validator` transforms | `'HIGH'` → stored as `'high'` |
| `@model_validator` cross-field | Invalid date range raises |
| `ConfigDict(extra='forbid')` | Unknown field raises |
| `ConfigDict(frozen=True)` | Attribute assignment raises |
| `model_dump()` returns dict | All fields in the result dict |
| `model_validate(dict)` creates model | Creates from a plain dict |

---

## Quick Check Answers

**1. `title: str` receives `123`. Raise or coerce?**

Coerce — Pydantic v2 is in "lax mode" by default. Compatible types are coerced:
`123` (int) → `'123'` (str). To prevent this, add `model_config = ConfigDict(strict=True)`.
In strict mode, `123` would raise a `ValidationError` because it is not a `str`.

**2. `priority: str` restricted to `'low'`, `'medium'`, `'high'` — three options:**

(1) `@field_validator('priority')` — raises `ValueError` for invalid values.
(2) `Field(pattern=r'^(low|medium|high)$')` — regex constraint.
(3) Change the field type to the `Priority` `StrEnum` — Pydantic validates enum values automatically.
Option 1 or 3 is recommended — they produce clear error messages.

**3. `due_date: date | None` holds `date(2025, 12, 31)`. What does `model_dump()` return?**

By default (`model_dump()`): the Python `date` object — `datetime.date(2025, 12, 31)`.
To get a string: `model_dump(mode='json')` → `{'due_date': '2025-12-31'}`.
Or `model_dump_json()` → the full JSON string. FastAPI's `JSONResponse` automatically
calls `model_dump_json()` when you declare `response_model=TaskResponse`.
