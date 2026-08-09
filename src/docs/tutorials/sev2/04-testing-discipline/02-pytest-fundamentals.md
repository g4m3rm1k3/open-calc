# Tutorial 2: Pytest Fundamentals

## Introduction

**pytest** is Python's most popular testing framework. It's:
- Simple to write tests
- Powerful for complex scenarios
- Excellent for TDD workflow

---

## Part 1: Install and Verify

### 1.1 Install pytest

```bash
pip install pytest
```

### 1.2 Verify Installation

```bash
pytest --version
```

Should show: `pytest 7.x.x`

---

## Part 2: Your First Test

### 2.1 Create Test File

Create `tests/unit/test_example.py`:

```python
"""Example test to verify pytest works."""


def test_addition():
    """Basic arithmetic test."""
    assert 2 + 2 == 4


def test_string():
    """Basic string test."""
    message = "PartFlow"
    assert message.startswith("Part")
    assert len(message) == 8
```

### 2.2 Run Tests

```bash
pytest
```

Output:
```
=================== test session starts ===================
collected 2 items

tests/unit/test_example.py ..                        [100%]

==================== 2 passed in 0.01s ====================
```

### 2.3 Understanding Output

| Symbol | Meaning |
|--------|---------|
| `.` | Test passed |
| `F` | Test failed |
| `E` | Test errored (exception) |
| `s` | Test skipped |

---

## Part 3: Assertions

### 3.1 Basic Assertions

pytest uses Python's `assert` statement:

```python
def test_assertions():
    # Equality
    assert 1 == 1
    assert "hello" == "hello"
    
    # Truthiness
    assert True
    assert [1, 2, 3]  # Non-empty list is truthy
    assert not None
    
    # Comparisons
    assert 5 > 3
    assert 10 <= 10
    
    # Membership
    assert 2 in [1, 2, 3]
    assert "art" in "PartFlow"
    
    # Identity
    value = None
    assert value is None
```

### 3.2 Assertion Messages

Add context to failures:

```python
def test_with_message():
    result = calculate_something()
    assert result == expected, f"Expected {expected} but got {result}"
```

### 3.3 pytest Shows Details

When assertions fail, pytest shows helpful context:

```python
def test_failing():
    assert [1, 2, 3] == [1, 2, 4]
```

Output:
```
    def test_failing():
>       assert [1, 2, 3] == [1, 2, 4]
E       AssertionError: assert [1, 2, 3] == [1, 2, 4]
E         At index 2 diff: 3 != 4
```

---

## Part 4: Testing Exceptions

### 4.1 Expect an Exception

Use `pytest.raises()`:

```python
import pytest


def test_division_by_zero():
    """Division by zero should raise ZeroDivisionError."""
    with pytest.raises(ZeroDivisionError):
        result = 1 / 0


def test_invalid_index():
    """Invalid index should raise IndexError."""
    items = [1, 2, 3]
    with pytest.raises(IndexError):
        items[10]
```

### 4.2 Check Exception Message

```python
def test_exception_message():
    """Verify exception contains expected message."""
    with pytest.raises(ValueError, match="cannot be empty"):
        raise ValueError("Name cannot be empty")
```

The `match` parameter is a regex pattern.

### 4.3 Access Exception Details

```python
def test_exception_details():
    """Access exception object for detailed checks."""
    with pytest.raises(ValueError) as exc_info:
        raise ValueError("Invalid value: 42")
    
    # exc_info.value is the actual exception
    assert "42" in str(exc_info.value)
```

---

## Part 5: Test Classes

### 5.1 Organizing with Classes

Group related tests in a class:

```python
class TestPartNumber:
    """Tests for PartNumber value object."""
    
    def test_valid_format(self):
        """Standard format should be accepted."""
        pn = PartNumber("PN-12345")
        assert str(pn) == "PN-12345"
    
    def test_invalid_format(self):
        """Invalid format should raise."""
        with pytest.raises(ValueError):
            PartNumber("invalid")
```

### 5.2 Class Benefits

- Logical grouping
- Shared setup (using fixtures)
- Clear test organization
- Better output structure

---

## Part 6: Running Tests

### 6.1 Run All Tests

```bash
pytest
```

### 6.2 Run Specific File

```bash
pytest tests/unit/test_example.py
```

### 6.3 Run Specific Test

```bash
pytest tests/unit/test_example.py::test_addition
```

### 6.4 Run Tests Matching Pattern

```bash
pytest -k "part_number"  # Tests with "part_number" in name
```

### 6.5 Verbose Output

```bash
pytest -v
```

Shows each test name:
```
tests/unit/test_example.py::test_addition PASSED
tests/unit/test_example.py::test_string PASSED
```

### 6.6 Stop on First Failure

```bash
pytest -x
```

### 6.7 Show Print Statements

```bash
pytest -s
```

---

## Part 7: Exercises

### Exercise 1: Write Basic Tests

Create `tests/unit/domain/test_errors.py`:

1. Test that ValidationError stores field and message
2. Test that NotFoundError stores entity_type and identifier
3. Test that error string includes the field/identifier

<details>
<summary>Solution</summary>

```python
import pytest
from partflow.domain.errors import ValidationError, NotFoundError


class TestValidationError:
    """Tests for ValidationError."""
    
    def test_stores_field_and_message(self):
        err = ValidationError("name", "cannot be empty")
        assert err.field == "name"
        assert err.message == "cannot be empty"
    
    def test_string_contains_field(self):
        err = ValidationError("email", "invalid format")
        assert "email" in str(err)


class TestNotFoundError:
    """Tests for NotFoundError."""
    
    def test_stores_entity_type_and_identifier(self):
        err = NotFoundError("Part", "PN-12345")
        assert err.entity_type == "Part"
        assert err.identifier == "PN-12345"
    
    def test_string_contains_identifier(self):
        err = NotFoundError("Machine", "MCH-001")
        assert "MCH-001" in str(err)
```

</details>

---

### Exercise 2: Test with Exceptions

Write tests for a function that:
- Raises `ValueError` if input is None
- Raises `TypeError` if input is not a string

<details>
<summary>Solution</summary>

```python
import pytest


def validate_string(value):
    """Validate that value is a non-None string."""
    if value is None:
        raise ValueError("Value cannot be None")
    if not isinstance(value, str):
        raise TypeError("Value must be a string")
    return value


class TestValidateString:
    
    def test_valid_string_returns(self):
        result = validate_string("hello")
        assert result == "hello"
    
    def test_none_raises_value_error(self):
        with pytest.raises(ValueError, match="cannot be None"):
            validate_string(None)
    
    def test_non_string_raises_type_error(self):
        with pytest.raises(TypeError, match="must be a string"):
            validate_string(123)
```

</details>

---

## Summary

### Key Commands

| Command | Purpose |
|---------|---------|
| `pytest` | Run all tests |
| `pytest -v` | Verbose output |
| `pytest -x` | Stop on first failure |
| `pytest -k "pattern"` | Run matching tests |
| `pytest path/to/test.py` | Run specific file |

### Key Concepts

| Concept | Syntax |
|---------|--------|
| Basic assertion | `assert value == expected` |
| Expect exception | `with pytest.raises(ExceptionType):` |
| Match error message | `pytest.raises(Error, match="pattern")` |
| Test class | `class TestSomething:` |

### Pytest Checklist

- [ ] pytest installed
- [ ] Tests discovered and run
- [ ] Understand assertion output
- [ ] Can test exceptions
- [ ] Can run specific tests

---

## Next Tutorial

[Tutorial 3: Test Organization →](./03-test-organization.md)
