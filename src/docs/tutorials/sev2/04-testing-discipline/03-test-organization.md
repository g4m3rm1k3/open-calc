# Tutorial 3: Test Organization

## Introduction

Well-organized tests are:
- Easy to find
- Easy to understand
- Mirror the code structure
- Run quickly

---

## Part 1: Test Directory Structure

### 1.1 Mirror Source Structure

```
src/partflow/                    tests/
├── domain/                      ├── unit/
│   ├── entities/               │   └── domain/
│   │   └── part.py            │       ├── entities/
│   └── value_objects/          │       │   └── test_part.py
│       └── part_number.py      │       └── value_objects/
│                                │           └── test_part_number.py
├── repository/                  ├── integration/
│   └── sqlite/                  │   └── repository/
│       └── part_repository.py  │       └── test_part_repository.py
│                                │
└── service/                     └── e2e/
    └── part_service.py              └── test_part_workflow.py
```

### 1.2 Why This Structure?

| Benefit | Explanation |
|---------|-------------|
| **Discoverability** | Code at `domain/entities/part.py` → tests at `test_part.py` |
| **Separation** | Unit tests separate from integration tests |
| **Speed** | Can run fast unit tests separately |
| **Clarity** | Test type is obvious from location |

---

## Part 2: Test Types

### 2.1 Unit Tests

**Location:** `tests/unit/`

**Characteristics:**
- Test one thing in isolation
- No database, no network
- Very fast (milliseconds)
- Most of your tests

```python
# tests/unit/domain/value_objects/test_part_number.py

class TestPartNumber:
    def test_valid_format(self):
        pn = PartNumber("PN-12345")
        assert str(pn) == "PN-12345"
```

### 2.2 Integration Tests

**Location:** `tests/integration/`

**Characteristics:**
- Test multiple components together
- Use real database (test instance)
- Slower (seconds)
- Fewer than unit tests

```python
# tests/integration/repository/test_part_repository.py

class TestPartRepository:
    def test_save_and_retrieve(self, db):
        repo = SQLitePartRepository(db)
        part = Part("PN-12345", "Test Part")
        
        repo.save(part)
        loaded = repo.find_by_number("PN-12345")
        
        assert loaded.name == "Test Part"
```

### 2.3 End-to-End Tests

**Location:** `tests/e2e/`

**Characteristics:**
- Test complete workflows
- Full application stack
- Slowest
- Fewest tests

```python
# tests/e2e/test_part_workflow.py

class TestPartWorkflow:
    def test_create_and_list_parts(self, client):
        # Create via API
        response = client.post("/parts", data={
            "part_number": "PN-12345",
            "name": "New Part"
        })
        assert response.status_code == 201
        
        # Verify in list
        response = client.get("/parts")
        assert "PN-12345" in response.data.decode()
```

---

## Part 3: The Test Pyramid

```
                    ┌─────────┐
                    │  E2E    │ Few (slow, expensive)
                   ┌┴─────────┴┐
                   │Integration │ Some (medium speed)
                  ┌┴───────────┴┐
                  │    Unit      │ Many (fast, cheap)
                  └──────────────┘
```

| Type | Quantity | Speed | Cost |
|------|----------|-------|------|
| Unit | Many | Fast | Low |
| Integration | Some | Medium | Medium |
| E2E | Few | Slow | High |

---

## Part 4: Test File Conventions

### 4.1 File Naming

| Pattern | Meaning |
|---------|---------|
| `test_*.py` | pytest discovers these |
| `*_test.py` | Also discovered (less common) |
| `conftest.py` | Shared fixtures |

### 4.2 Test Function Naming

```python
def test_<what>_<behavior>():
    """Descriptive docstring."""
    pass

# Examples
def test_part_number_validates_format():
    ...

def test_part_creation_requires_name():
    ...

def test_repository_raises_on_duplicate():
    ...
```

### 4.3 Test Class Naming

```python
class Test<Thing>:
    """Tests for <Thing>."""
    
    def test_<scenario>(self):
        ...

# Example
class TestPartNumber:
    def test_valid_format(self):
        ...
    
    def test_invalid_format_raises(self):
        ...
```

---

## Part 5: conftest.py

### 5.1 What is conftest.py?

A special pytest file that:
- Contains shared fixtures
- Is automatically loaded
- Applies to directory and subdirectories

### 5.2 Example conftest.py

```python
# tests/conftest.py

import pytest
from partflow.web.app import create_app


@pytest.fixture
def app():
    """Create application for testing."""
    return create_app("testing")


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()
```

### 5.3 Fixture Scope

Different conftest.py files for different scopes:

```
tests/
├── conftest.py              # Shared across ALL tests
├── unit/
│   └── conftest.py          # Shared across unit tests
├── integration/
│   └── conftest.py          # Shared across integration tests
│   └── repository/
│       └── conftest.py      # Shared across repository tests
```

---

## Part 6: Create Test Structure

### 6.1 Set Up Directories

```powershell
# Create test directories
mkdir tests\unit\domain\entities
mkdir tests\unit\domain\value_objects
mkdir tests\unit\domain\interfaces
mkdir tests\unit\service
mkdir tests\integration\repository
mkdir tests\e2e
```

### 6.2 Create __init__.py Files

```powershell
# Create init files
New-Item tests\unit\domain\__init__.py -ItemType File
New-Item tests\unit\domain\entities\__init__.py -ItemType File
New-Item tests\unit\domain\value_objects\__init__.py -ItemType File
New-Item tests\unit\domain\interfaces\__init__.py -ItemType File
New-Item tests\unit\service\__init__.py -ItemType File
New-Item tests\integration\repository\__init__.py -ItemType File
New-Item tests\e2e\__init__.py -ItemType File
```

### 6.3 Create Root conftest.py

Create `tests/conftest.py`:

```python
"""Shared pytest fixtures for all tests."""

import pytest


@pytest.fixture
def app():
    """Create application for testing."""
    from partflow.web.app import create_app
    return create_app("testing")


@pytest.fixture
def client(app):
    """Create Flask test client."""
    return app.test_client()
```

---

## Part 7: Exercises

### Exercise 1: Create Test Files

Create these test files with at least one placeholder test each:

1. `tests/unit/domain/test_errors.py`
2. `tests/unit/domain/value_objects/test_part_number.py`
3. `tests/integration/repository/test_part_repository.py`

<details>
<summary>Solution</summary>

```python
# tests/unit/domain/test_errors.py
def test_placeholder():
    """Placeholder until real tests written."""
    assert True
```

```python
# tests/unit/domain/value_objects/test_part_number.py
def test_placeholder():
    """Placeholder until PartNumber is implemented."""
    assert True
```

```python
# tests/integration/repository/test_part_repository.py
def test_placeholder():
    """Placeholder until repository is implemented."""
    assert True
```

</details>

---

### Exercise 2: Run Tests by Type

Run only unit tests:
```bash
pytest tests/unit/
```

Run only integration tests:
```bash
pytest tests/integration/
```

Verify both work.

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Mirror structure** | Tests match source layout |
| **Unit tests** | Fast, isolated |
| **Integration tests** | Component interaction |
| **E2E tests** | Full workflows |
| **conftest.py** | Shared fixtures |

### Test Organization Checklist

- [ ] Test directories mirror source
- [ ] Unit tests in `tests/unit/`
- [ ] Integration tests in `tests/integration/`
- [ ] conftest.py for shared fixtures
- [ ] All __init__.py files created

---

## Next Tutorial

[Tutorial 4: Fixtures and Mocking →](./04-fixtures-mocking.md)
