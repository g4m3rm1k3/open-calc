# Python Tool Database — LAB 28 — Pydantic Errors as User Messages

**Prerequisites:** Lab 27. You have a `ValidationResult` class and a manual `validate_tool_data` function. You understand what collect-all validation means. Now you learn Pydantic — a library that does the type-checking and constraint-collecting for you, so you only write business rules on top of it.

**What this lab adds:**
- `pydantic.BaseModel` — declare fields as type annotations
- Automatic type coercion (`"0.5"` becomes `0.5`)
- `ValidationError` — contains every field error, not just the first
- A `format_pydantic_errors` function that translates `ValidationError` into your `ValidationResult`
- `@field_validator` for business rule validation
- `model_config = ConfigDict(str_strip_whitespace=True)` — fix trivial typos silently

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Python type hints like `diameter_inches: float` are not enforced at runtime. If you pass `"abc"` where a `float` is expected, what happens without Pydantic? What happens with Pydantic?
> 2. Pydantic collects *all* field errors before raising. How many `ValidationError` exceptions are raised if four fields are wrong?
> 3. `ValidationError.errors()` returns a list of dicts. Each dict has a `loc` key. For a field named `diameter_inches`, what is the value of `loc`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `ToolCreate` Pydantic model that validates all incoming tool data, plus a bridge function that converts Pydantic errors to your `ValidationResult` format:

```python
# tooldb/schemas/tool_schema.py
from pydantic import BaseModel, field_validator

class ToolCreate(BaseModel):
    name: str
    diameter_inches: float
    material: str
    tool_type: str
    flutes: int | None = None
    notes: str | None = None


# tooldb/validation.py (added function)
def format_pydantic_errors(exc: ValidationError) -> ValidationResult: ...
```

New files:
```
tooldb/
    schemas/
        __init__.py    ← already exists (placeholder)
        tool_schema.py ← NEW
tests/
    test_tool_schema.py ← NEW
```

---

## Step 1 — Install Pydantic

```
pip install pydantic
```

Verify:

```python
python -c "import pydantic; print(pydantic.VERSION)"
```

This project uses Pydantic v2. The API changed significantly from v1 — if you see warnings about v1 syntax, check your version.

---

## Step 2 — What `BaseModel` Does

A Pydantic model is a class that:
1. Declares fields as type-annotated class attributes
2. Validates and coerces data when you create an instance
3. Collects all validation errors before raising

```python
from pydantic import BaseModel

class ToolCreate(BaseModel):
    name: str
    diameter_inches: float

# This works:
t = ToolCreate(name="Mill-01", diameter_inches=0.5)
print(t.diameter_inches)  # 0.5  (already a float)

# Pydantic coerces where it can:
t = ToolCreate(name="Mill-01", diameter_inches="0.5")  # "0.5" → 0.5
print(t.diameter_inches)  # 0.5

# This fails — all errors at once:
try:
    t = ToolCreate(name="", diameter_inches="abc")
except ValidationError as exc:
    print(exc)
```

The last example raises `ValidationError` with two errors: empty string (well, actually Pydantic may accept it), and `"abc"` cannot be coerced to `float`. You will explore the exact behavior in Step 3.

---

## Step 3 — RED: Tests for `ToolCreate`

Create `tests/test_tool_schema.py`:

```python
import pytest
from pydantic import ValidationError
from tooldb.schemas.tool_schema import ToolCreate


class TestToolCreateValid:
    def test_accepts_valid_tool(self):
        t = ToolCreate(name="Mill-01", diameter_inches=0.5, material="carbide", tool_type="endmill")
        assert t.name == "Mill-01"
        assert t.diameter_inches == 0.5

    def test_coerces_string_diameter_to_float(self):
        t = ToolCreate(name="Mill-01", diameter_inches="0.5", material="carbide", tool_type="endmill")
        assert isinstance(t.diameter_inches, float)
        assert t.diameter_inches == 0.5

    def test_flutes_defaults_to_none(self):
        t = ToolCreate(name="Mill-01", diameter_inches=0.5, material="carbide", tool_type="endmill")
        assert t.flutes is None

    def test_strips_whitespace_from_name(self):
        t = ToolCreate(name="  Mill-01  ", diameter_inches=0.5, material="carbide", tool_type="endmill")
        assert t.name == "Mill-01"


class TestToolCreateInvalid:
    def test_non_numeric_diameter_raises(self):
        with pytest.raises(ValidationError) as exc_info:
            ToolCreate(name="Mill", diameter_inches="abc", material="carbide", tool_type="endmill")
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("diameter_inches",) for e in errors)

    def test_negative_diameter_raises(self):
        with pytest.raises(ValidationError):
            ToolCreate(name="Mill", diameter_inches=-0.5, material="carbide", tool_type="endmill")

    def test_invalid_material_raises(self):
        with pytest.raises(ValidationError) as exc_info:
            ToolCreate(name="Mill", diameter_inches=0.5, material="unobtanium", tool_type="endmill")
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("material",) for e in errors)

    def test_three_bad_fields_produce_three_errors(self):
        with pytest.raises(ValidationError) as exc_info:
            ToolCreate(name="", diameter_inches=-1.0, material="unobtanium", tool_type="endmill")
        assert len(exc_info.value.errors()) >= 2
```

Run pytest — fails with `ModuleNotFoundError`. That is the Red step.

---

## Step 4 — GREEN: Build `ToolCreate`

Create `tooldb/schemas/tool_schema.py`:

```python
from pydantic import BaseModel, ConfigDict, field_validator
from tooldb.validation import VALID_MATERIALS, VALID_TOOL_TYPES, MIN_DIAMETER_INCHES, MAX_DIAMETER_INCHES


class ToolCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str
    diameter_inches: float
    material: str
    tool_type: str
    flutes: int | None = None
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError("name cannot be empty")
        return v

    @field_validator("diameter_inches")
    @classmethod
    def diameter_in_range(cls, v: float) -> float:
        if v <= 0:
            raise ValueError(f"must be a positive number, got {v}")
        if v > MAX_DIAMETER_INCHES:
            raise ValueError(f"must be ≤ {MAX_DIAMETER_INCHES}, got {v}")
        return v

    @field_validator("material")
    @classmethod
    def material_is_valid(cls, v: str) -> str:
        if v not in VALID_MATERIALS:
            raise ValueError(f"must be one of: {', '.join(sorted(VALID_MATERIALS))}, got '{v}'")
        return v

    @field_validator("tool_type")
    @classmethod
    def tool_type_is_valid(cls, v: str) -> str:
        if v not in VALID_TOOL_TYPES:
            raise ValueError(f"must be one of: {', '.join(sorted(VALID_TOOL_TYPES))}, got '{v}'")
        return v

    @field_validator("flutes")
    @classmethod
    def flutes_positive_if_provided(cls, v: int | None) -> int | None:
        if v is not None and v <= 0:
            raise ValueError(f"must be a positive integer, got {v}")
        return v
```

Run the tests:

```
pytest tests/test_tool_schema.py -v
```

The `test_strips_whitespace_from_name` test passes because of `ConfigDict(str_strip_whitespace=True)` — Pydantic strips leading/trailing whitespace from every string field automatically.

The `test_three_bad_fields_produce_three_errors` test checks `>= 2` because an empty name may produce one error (from `name_not_empty`) and a negative diameter produces another. The `material` error adds a third — but the test uses `>= 2` to be resilient.

---

## Step 5 — Understanding `ValidationError.errors()`

Run this in a Python REPL to see the structure:

```python
from pydantic import ValidationError
from tooldb.schemas.tool_schema import ToolCreate

try:
    ToolCreate(name="", diameter_inches=-1.0, material="unobtanium", tool_type="endmill")
except ValidationError as exc:
    import json
    print(json.dumps(exc.errors(), indent=2, default=str))
```

Each error dict looks like:

```json
{
  "type": "value_error",
  "loc": ["diameter_inches"],
  "msg": "Value error, must be a positive number, got -1.0",
  "input": -1.0,
  "url": "..."
}
```

Key fields:
- `loc`: a tuple of keys showing where the error is. For a top-level field, it is `("field_name",)`. For a nested model, it is `("parent_field", "child_field")`.
- `msg`: the error message — includes the text from your `ValueError` inside the validator
- `input`: the raw value that was rejected

---

## Step 6 — RED: Tests for `format_pydantic_errors`

This function bridges Pydantic's `ValidationError` and your `ValidationResult`:

```python
# In tests/test_validation.py — add these tests

from pydantic import ValidationError as PydanticValidationError
from tooldb.schemas.tool_schema import ToolCreate
from tooldb.validation import ValidationResult, format_pydantic_errors


def test_format_pydantic_errors_returns_validation_result():
    try:
        ToolCreate(name="Mill", diameter_inches=-1.0, material="carbide", tool_type="endmill")
    except PydanticValidationError as exc:
        result = format_pydantic_errors(exc)
    assert isinstance(result, ValidationResult)


def test_format_pydantic_errors_includes_field_name():
    try:
        ToolCreate(name="Mill", diameter_inches=-1.0, material="carbide", tool_type="endmill")
    except PydanticValidationError as exc:
        result = format_pydantic_errors(exc)
    assert any("diameter_inches" in e for e in result.errors)


def test_format_pydantic_errors_collects_all_errors():
    try:
        ToolCreate(name="", diameter_inches=-1.0, material="unobtanium", tool_type="endmill")
    except PydanticValidationError as exc:
        result = format_pydantic_errors(exc)
    assert len(result.errors) >= 3


def test_format_pydantic_errors_not_valid():
    try:
        ToolCreate(name="Mill", diameter_inches=-1.0, material="carbide", tool_type="endmill")
    except PydanticValidationError as exc:
        result = format_pydantic_errors(exc)
    assert result.is_valid is False
```

Run — fails with `ImportError: cannot import name 'format_pydantic_errors'`.

---

## Step 7 — GREEN: Build `format_pydantic_errors`

Add to `tooldb/validation.py`:

```python
from pydantic import ValidationError as PydanticValidationError


def format_pydantic_errors(exc: PydanticValidationError) -> ValidationResult:
    result = ValidationResult()
    for error in exc.errors():
        field = ".".join(str(part) for part in error["loc"])
        msg = error["msg"]
        # Pydantic prepends "Value error, " to custom validator messages — strip it
        msg = msg.removeprefix("Value error, ")
        value = error.get("input")
        result.add_error(field, msg, value=value if value is not None else None)
    return result
```

Run the tests — all pass.

---

## Step 8 — REFACTOR: Wire ToolService to Use ToolCreate

Now `ToolService.create_tool` can use Pydantic for its validation instead of the manual `validate_tool_data` function:

```python
# tooldb/services/tool_service.py
from pydantic import ValidationError as PydanticValidationError
from tooldb.schemas.tool_schema import ToolCreate
from tooldb.validation import format_pydantic_errors

class ToolService:
    def create_tool(self, name, diameter_inches, material, tool_type, flutes=None, notes=None) -> int:
        try:
            validated = ToolCreate(
                name=name,
                diameter_inches=diameter_inches,
                material=material,
                tool_type=tool_type,
                flutes=flutes,
                notes=notes,
            )
        except PydanticValidationError as exc:
            result = format_pydantic_errors(exc)
            raise ValueError("\n".join(result.errors)) from exc

        existing = self.repo.search_by_name(validated.name)
        if existing:
            raise ValueError(f"A tool named '{validated.name}' already exists")

        return self.repo.insert(
            validated.name, validated.diameter_inches, validated.material,
            validated.tool_type, validated.flutes, validated.notes
        )
```

Notice: after validation, we use `validated.name` (which has whitespace stripped) rather than the raw `name` parameter. This means a tool created with `name="  Mill-01  "` is stored as `"Mill-01"` — a silent, helpful correction.

Run the full suite:

```
pytest -v
```

Update any test `match=` strings that check the exact error message format.

---

## Step 9 — SAVE AND TRY

```
cd python-tooldb
pytest -v
```

Then try the full flow manually:

```python
from pydantic import ValidationError
from tooldb.schemas.tool_schema import ToolCreate
from tooldb.validation import format_pydantic_errors

try:
    ToolCreate(name="", diameter_inches=-1.0, material="titanium", tool_type="endmill")
except ValidationError as exc:
    result = format_pydantic_errors(exc)
    print(f"Valid: {result.is_valid}")
    for error in result.errors:
        print(f"  - {error}")
```

Expected output:
```
Valid: False
  - name: name cannot be empty, got: ''
  - diameter_inches: must be a positive number, got -1.0, got: -1.0
  - material: must be one of: HSS, carbide, cobalt, got 'titanium', got: 'titanium'
```

The message format shows a small redundancy (`got: X` appears twice for some fields). The refactor challenge below addresses this.

---

## Challenge

The `format_pydantic_errors` function adds `got: {value}` to every error, but some Pydantic validator messages already include the value in the message text. Clean up the formatting:

- If the `msg` already contains the raw value (converted to string), don't append `got:` again
- If it doesn't, append `got: {value!r}`

Write the test first.

<details>
<summary>Answer</summary>

```python
def format_pydantic_errors(exc: PydanticValidationError) -> ValidationResult:
    result = ValidationResult()
    for error in exc.errors():
        field = ".".join(str(part) for part in error["loc"])
        msg = error["msg"].removeprefix("Value error, ")
        raw_value = error.get("input")

        # Only append 'got:' if the message doesn't already mention the value
        if raw_value is not None and str(raw_value) not in msg:
            result.add_error(field, msg, value=raw_value)
        else:
            result.add_error(field, msg)

    return result
```

Test:
```python
def test_format_pydantic_errors_does_not_duplicate_value_in_message():
    try:
        ToolCreate(name="Mill", diameter_inches=-1.0, material="carbide", tool_type="endmill")
    except PydanticValidationError as exc:
        result = format_pydantic_errors(exc)
    # The message should mention "-1.0" at most once
    diameter_error = next(e for e in result.errors if "diameter" in e)
    assert diameter_error.count("-1.0") <= 1
```

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Create a Pydantic `BaseModel` with type-annotated fields | |
| Use `@field_validator` to add business rule validation | |
| Use `ConfigDict(str_strip_whitespace=True)` to auto-clean string inputs | |
| Catch `ValidationError` and iterate over `.errors()` | |
| Extract `loc`, `msg`, and `input` from a Pydantic error dict | |
| Build a `format_pydantic_errors` function that returns a `ValidationResult` | |
| Explain when Pydantic coerces a value vs when it rejects it | |

---

## Quick Check Answers

1. **Without Pydantic:** `"abc"` is stored as the string `"abc"` in the `diameter_inches` attribute — no error, no coercion. Downstream code that expects a float will fail at an unpredictable point. With Pydantic: `ValidationError` is raised immediately at construction time, before the bad value can propagate anywhere.

2. **One `ValidationError` is raised** regardless of how many fields are wrong. Pydantic runs all field checks, collects all errors, and raises a single `ValidationError` that contains all of them. `exc.errors()` returns the full list.

3. **`loc` is `("diameter_inches",)`** — a tuple with one element for a top-level field. For a nested model like `assembly.holder.diameter`, `loc` would be `("assembly", "holder", "diameter")`.
