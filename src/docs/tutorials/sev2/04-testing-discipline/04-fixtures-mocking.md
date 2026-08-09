# Tutorial 4: Fixtures and Mocking

## Introduction

**Fixtures** set up test preconditions.
**Mocking** isolates tests from dependencies.

Together they enable fast, reliable, independent tests.

---

## Part 1: What are Fixtures?

### 1.1 Definition

A **fixture** is reusable test setup code. Instead of repeating setup in every test:

```python
# WITHOUT fixtures (repetitive)
def test_add_part():
    repo = PartRepository()
    service = PartService(repo)
    service.create_part(...)

def test_get_part():
    repo = PartRepository()  # Same setup again!
    service = PartService(repo)
    part = service.get_part(...)
```

Use fixtures:

```python
# WITH fixtures (clean)
@pytest.fixture
def part_service():
    repo = PartRepository()
    return PartService(repo)

def test_add_part(part_service):
    part_service.create_part(...)

def test_get_part(part_service):
    part = part_service.get_part(...)
```

### 1.2 pytest Fixtures

pytest fixtures use the `@pytest.fixture` decorator:

```python
import pytest


@pytest.fixture
def sample_part():
    """Create a sample Part for testing."""
    return Part(
        part_number="PN-12345",
        name="Test Part",
    )


def test_part_has_name(sample_part):
    assert sample_part.name == "Test Part"
```

### 1.3 How Fixtures Work

1. pytest sees `sample_part` in test function parameters
2. pytest looks for a fixture named `sample_part`
3. pytest calls the fixture function
4. pytest passes the return value to the test

---

## Part 2: Fixture Scope

### 2.1 Function Scope (Default)

Creates new fixture for each test:

```python
@pytest.fixture  # scope="function" is default
def database():
    db = create_database()
    yield db
    db.close()  # Cleanup after each test
```

### 2.2 Class Scope

Shared within a test class:

```python
@pytest.fixture(scope="class")
def database():
    db = create_database()
    yield db
    db.close()  # Cleanup after all tests in class
```

### 2.3 Module Scope

Shared across entire test file:

```python
@pytest.fixture(scope="module")
def expensive_setup():
    return create_expensive_resource()
```

### 2.4 Session Scope

Shared across entire test run:

```python
@pytest.fixture(scope="session")
def database_schema():
    create_all_tables()
    yield
    drop_all_tables()
```

### 2.5 Choosing Scope

| Scope | Use When |
|-------|----------|
| function | Default, safest, most isolated |
| class | Tests in class share state |
| module | Expensive setup shared in file |
| session | Very expensive, one-time setup |

---

## Part 3: Fixture Dependencies

### 3.1 Fixtures Using Fixtures

Fixtures can depend on other fixtures:

```python
@pytest.fixture
def database():
    return create_test_database()


@pytest.fixture
def part_repository(database):  # Uses database fixture
    return PartRepository(database)


@pytest.fixture
def part_service(part_repository):  # Uses part_repository fixture
    return PartService(part_repository)


def test_create_part(part_service):  # Uses part_service fixture
    part_service.create_part("PN-12345", "Test")
```

### 3.2 Fixture Chain

```
database → part_repository → part_service → test
```

pytest automatically resolves the dependency chain.

---

## Part 4: What is Mocking?

### 4.1 The Problem

Testing service layer requires database:

```python
def test_part_service():
    # Real database needed!
    db = connect_to_database()
    repo = PartRepository(db)
    service = PartService(repo)
    ...
```

Problems:
- Slow (database I/O)
- Fragile (database state)
- Not isolated

### 4.2 The Solution: Mocks

A **mock** is a fake object that simulates real behavior:

```python
def test_part_service():
    # Fake repository
    mock_repo = MockPartRepository()
    service = PartService(mock_repo)
    ...
```

Benefits:
- Fast (no I/O)
- Reliable (controlled behavior)
- Isolated (no dependencies)

---

## Part 5: Creating Mock Objects

### 5.1 Simple Mock Class

Create a fake implementation:

```python
class MockPartRepository:
    """In-memory mock of PartRepository."""
    
    def __init__(self):
        self._parts = {}
    
    def save(self, part):
        self._parts[part.part_number] = part
    
    def find_by_number(self, part_number):
        return self._parts.get(part_number)
```

### 5.2 Using unittest.mock

Python's `unittest.mock` provides flexible mocking:

```python
from unittest.mock import Mock, MagicMock


def test_with_mock():
    # Create mock
    mock_repo = Mock()
    
    # Configure return value
    mock_repo.find_by_number.return_value = Part("PN-12345", "Test")
    
    # Use in service
    service = PartService(mock_repo)
    part = service.get_part("PN-12345")
    
    # Verify behavior
    mock_repo.find_by_number.assert_called_once_with("PN-12345")
    assert part.name == "Test"
```

### 5.3 Mock Call Verification

```python
from unittest.mock import Mock

mock = Mock()
mock.some_method("arg1", "arg2")

# Verify calls
mock.some_method.assert_called()
mock.some_method.assert_called_once()
mock.some_method.assert_called_with("arg1", "arg2")
mock.some_method.assert_called_once_with("arg1", "arg2")
```

---

## Part 6: Fixtures for Mocking

### 6.1 Mock Repository Fixture

```python
# tests/conftest.py

import pytest
from unittest.mock import Mock


@pytest.fixture
def mock_part_repository():
    """Create a mock PartRepository."""
    mock = Mock()
    mock.find_by_number.return_value = None  # Default: not found
    mock.all.return_value = []
    return mock


@pytest.fixture
def part_service(mock_part_repository):
    """Create PartService with mock repository."""
    from partflow.service.part_service import PartService
    return PartService(mock_part_repository)
```

### 6.2 Using Mock Fixtures

```python
def test_create_part(part_service, mock_part_repository):
    # Configure mock
    mock_part_repository.find_by_number.return_value = None  # Doesn't exist
    
    # Create part
    part = part_service.create_part("PN-12345", "New Part")
    
    # Verify repository called
    mock_part_repository.save.assert_called_once()


def test_cannot_create_duplicate(part_service, mock_part_repository):
    # Configure mock to return existing part
    mock_part_repository.find_by_number.return_value = Part("PN-12345", "Existing")
    
    # Should raise
    with pytest.raises(DuplicateEntityError):
        part_service.create_part("PN-12345", "New Part")
```

---

## Part 7: In-Memory Repository Pattern

### 7.1 Better Than Raw Mocks

For repositories, a real in-memory implementation is often better than mocks:

```python
# tests/fakes.py

from typing import Dict, Optional
from partflow.domain.entities import Part
from partflow.domain.interfaces import PartRepositoryInterface


class InMemoryPartRepository(PartRepositoryInterface):
    """In-memory implementation for testing."""
    
    def __init__(self):
        self._parts: Dict[str, Part] = {}
    
    def save(self, part: Part) -> None:
        self._parts[str(part.part_number)] = part
    
    def find_by_number(self, part_number: str) -> Optional[Part]:
        return self._parts.get(part_number)
    
    def find_by_id(self, part_id: str) -> Optional[Part]:
        for part in self._parts.values():
            if str(part.id) == part_id:
                return part
        return None
    
    def all(self) -> list[Part]:
        return list(self._parts.values())
```

### 7.2 Why In-Memory is Better

| unittest.mock | InMemoryRepository |
|---------------|-------------------|
| Must configure every call | Implements real interface |
| Can miss method calls | Same behavior as real repo |
| Fragile to implementation changes | Only change if interface changes |
| Tests mock, not behavior | Tests actual behavior |

---

## Part 8: Exercises

### Exercise 1: Create a Fixture

Create a fixture that provides a sample Part:

```python
@pytest.fixture
def sample_part():
    # Your code here
    pass
```

<details>
<summary>Solution</summary>

```python
import pytest
from partflow.domain.entities import Part


@pytest.fixture
def sample_part():
    """Create a sample Part for testing."""
    return Part(
        id=uuid4(),
        part_number="PN-12345",
        name="Test Part",
        description="A part for testing",
    )
```

</details>

---

### Exercise 2: Create In-Memory Repository

Create an in-memory Machine repository for testing.

<details>
<summary>Solution</summary>

```python
class InMemoryMachineRepository:
    """In-memory Machine repository for testing."""
    
    def __init__(self):
        self._machines = {}
    
    def save(self, machine):
        self._machines[str(machine.machine_id)] = machine
    
    def find_by_id(self, machine_id):
        return self._machines.get(machine_id)
    
    def all(self):
        return list(self._machines.values())
```

</details>

---

### Exercise 3: Test with Mock

Write a test that verifies the service calls repository.save() when creating a part.

<details>
<summary>Solution</summary>

```python
from unittest.mock import Mock


def test_create_part_calls_save():
    # Arrange
    mock_repo = Mock()
    mock_repo.find_by_number.return_value = None
    service = PartService(mock_repo)
    
    # Act
    service.create_part("PN-12345", "Test Part")
    
    # Assert
    mock_repo.save.assert_called_once()
    
    # Verify the Part that was saved
    saved_part = mock_repo.save.call_args[0][0]
    assert saved_part.part_number == "PN-12345"
    assert saved_part.name == "Test Part"
```

</details>

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Fixture** | Reusable test setup |
| **Fixture scope** | Control fixture lifetime |
| **Mock** | Fake dependency for isolation |
| **InMemory implementation** | Full interface compliance |

### Fixtures and Mocking Checklist

- [ ] Understand fixture scope
- [ ] Can create fixtures in conftest.py
- [ ] Can use unittest.mock
- [ ] Can verify mock calls
- [ ] Know when to use InMemory vs Mock

---

## Phase 04 Complete!

You now have testing fundamentals:
- ✅ TDD philosophy
- ✅ pytest basics
- ✅ Test organization
- ✅ Fixtures and mocking

**Next:** [Phase 05: Parts Domain →](../05-parts-domain/README.md)

In Phase 05, you'll implement the first feature—Parts—using TDD from the start.
